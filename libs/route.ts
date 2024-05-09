/**
 * @file 注册路由工具
 * @date 2022-06-25
 * @author Perfumere
 */

import { resolve } from 'path';
import { readdirSync, existsSync, writeFile } from 'fs';
import multer from 'fastify-multer';
import {
    __genMailer,
    __genTokenUtil,
    __genSignUtil,
    __genHandlerUtils,
    __getSymbols,
    __genSymbol,
    __genUrl,
    __checkType,
    __throwError
} from '../utils';
import { GledeRouter, getServerInstance } from './base';
import { __preprocessRouter, __preprocessCors, __preprocessSign } from '../plugins';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * 获取路由信息, 默认记录在logs/routers.txt
 */
export function printRouters(opts: GledeServerOpts) {
    if (!getServerInstance()) {
        __throwError('printRouters should excute on server running');
        return null;
    }

    __genInfoFile('routers.txt', getServerInstance().printRoutes(), opts);
}

/**
 * [注册接口文档生成工具Swagger](https://github.com/fastify/fastify-swagger)
 */
async function __registerSwagger(app: FastifyInstance, opts: GledeServerOpts) {
    await app.register(import('@fastify/swagger'), opts.apiDocs);
}

async function __registryPlugins(app: FastifyInstance, opts: GledeServerOpts) {
    if (opts.apiDocs) {
        await __registerSwagger(app, opts);
    }
    if (opts.token) {
        __genTokenUtil(opts);
    }
    if (opts.sign) {
        __genSignUtil(opts);
    }
    if (opts.mailer) {
        __genMailer(opts);
    }
}

function __registryReadyCb(
    app: FastifyInstance,
    opts: GledeServerOpts,
    cb: (_: Error, adr: string) => void
) {
    const callback = __checkType(cb, 'function')
                ? cb : (_, adr) => !_ && console.log(`GledeServer is running at ${adr}`);

    app.listen({ port: opts.port, host: opts.host }, callback);
    app.ready(_ => {
        if (__checkType(app.swagger, 'function')) {
            __genInfoFile('apis.json', JSON.stringify(app.swagger(), null, 2), opts);
        }

        printRouters(opts);
    });
}

/**
 * 注册路由信息
 */
export async function __registerRouter(
    server: FastifyInstance,
    opts: GledeServerOpts,
    cb: (_: Error, adr: string) => void
) {
    await __registryPlugins(server, opts);

    for (const router of readdirSync(opts.routerDir)) {
        const route = resolve(opts.routerDir, router);

        for (const api of readdirSync(route)) {
            let routerPath = resolve(route, api);

            if (!api.endsWith('.ts')) {
                routerPath = resolve(routerPath, 'index.ts');
            }
            if (!existsSync(routerPath)) {
                continue;
            }

            const pkgs = require(routerPath);

            for (const key of Object.keys(pkgs)) {
                if (!__checkType(pkgs[key], 'function')) {
                    continue;
                }
                if (!(pkgs[key].prototype instanceof GledeRouter)) {
                    continue;
                }

                let type = '/';
                const isMain = api === 'index' || api === 'index.ts';
                if (router !== 'common') {
                    type += router;
                }

                __genRouter(server, pkgs[key], type, isMain ? '' : api.split('.')[0]);
            }
        }
    }

    __registryReadyCb(server, opts, cb);
}

function __genRouter(app: FastifyInstance, target: Function, type: string, path: string) {
    if (!__checkType(target, 'function')) {
        return;
    }

    const routerData = target.prototype as GledeRouterRecord;
    const routerKeys = __getSymbols(routerData);

    for (const symbol of routerKeys) {
        const {
            subpath,
            version,
            method,
            schema,
            handler,
        } = routerData[symbol];
        const cors = handler[__genSymbol('cors')];
        const multipart = handler[__genSymbol('multipart')];
        const url = __genUrl(type, version, path, subpath);

        const router = {
            method,
            url,
            handler: __genRouterHandler(handler),
            onSend: __genRouterSend
        } as any;

        if (__checkType(schema, 'object')) {
            router.schema = schema;
        }

        if (cors) {
            app.options(url, (req, res) => {
                __preprocessCors(req, res, cors);
                res.send();
            });
        }

        if (multipart) {
            const upload = multer(multipart.opts);
            const getOpts = multipart.getOpts;
            let preHandler: any;

            if (getOpts.single) {
                preHandler = upload.single(getOpts.single);
            }
            else if (
                __checkType(getOpts, 'object') &&
                __checkType(getOpts.name, 'string') &&
                __checkType(getOpts.maxCount, 'number')
            ) {
                preHandler = upload.array(getOpts.name, getOpts.maxCount);
            }
            if (__checkType(getOpts, 'array')) {
                preHandler = upload.fields(getOpts);
            }

            router.preHandler = preHandler;
        }

        app.route(router);
    }
}

/** 预处理失败的响应体 */
const PREHANDL_ERR = {
    code: 401,
    data: null,
    msg: 'noauth'
};

/** 验签失败的响应体 */
const SIGN_ERR = {
    code: 403,
    data: null,
    msg: 'forbidden'
};

/** 处理成功空响应 */
const SUCCESS_EMPTY = {
    code: 0,
    data: null
};

function __genRouterHandler(handler) {
    if (__checkType(handler, 'asyncfunction')) {
        return async (req: FastifyRequest, res: FastifyReply) => {
            if (!__preprocessSign(req, res, handler)) {
                return SIGN_ERR;
            }
            if (!__preprocessRouter(req, res, handler)) {
                return PREHANDL_ERR;
            }
    
            const { body, params, query } = req;
    
            const processRes = await handler.call(
                __genHandlerUtils(req, res),
                {
                    body,
                    params,
                    query,
                    // @ts-ignore
                    file: req.file,
                    // @ts-ignore
                    files: req.files
                }
            );
    
            if (processRes === undefined || processRes === null) {
                return SUCCESS_EMPTY;
            }
    
            return processRes;
        }
    }

    return (req: FastifyRequest, res: FastifyReply) => {
        if (!__preprocessSign(req, res, handler)) {
            return SIGN_ERR;
        }
        if (!__preprocessRouter(req, res, handler)) {
            return PREHANDL_ERR;
        }

        const { body, params, query } = req;

        const processRes = handler.call(
            __genHandlerUtils(req, res),
            { body, params, query }
        );

        if (processRes === undefined || processRes === null) {
            return SUCCESS_EMPTY;
        }

        return processRes;
    };
}

async function __genRouterSend(_, res, payload: string) {
    const code = res.statusCode;

    if (code < 200 || (code > 299 && code !== 304)) {
        if (!__checkType(payload, 'string')) {
            payload = '';
        }

        const result = payload.match(/"message":"(.+)"/);

        res.code(200);
        return `{"code":1,"data":null,"msg":"${result && result[1]}"}`;
    }
}

function __genInfoFile(filename: string, content: string, opts: GledeServerOpts) {
    writeFile(resolve(opts.infoDir, filename), content, _ => undefined);
}
