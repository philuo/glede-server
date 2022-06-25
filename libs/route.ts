/**
 * @file 注册路由工具
 * @date 2022-06-25
 * @author Perfumere
 */

import { resolve } from 'path';
import { readdirSync, existsSync, writeFile } from 'fs';
import {
    __genHandlerUtils,
    __getSymbols,
    __genSymbol,
    __genUrl,
    __checkType
} from './util';
import { GledeRouter, getServerInstance } from './base';
import { __preprocessRouter } from '../plugins';
import type { FastifyInstance, FastifyRequest ,FastifyReply } from 'fastify';

/**
 * 获取路由信息, 默认记录在logs/routers.txt
 * @returns void
 */
export function printRouters(opts: GledeServerOpts) {
    if (!getServerInstance()) {
        console.log('启动服务后查看路由信息');
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

/**
 * 注册路由信息
 * Default: path = 'routers'
 * @param path 路由目录路径
 */
export async function __registerRouter(
    server: FastifyInstance,
    opts: GledeServerOpts,
    cb: (_: Error, adr: string) => void
) {
    if (opts.apiDocs) {
        await __registerSwagger(server, opts);
    }

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
                if (router !== 'common') {
                    type += router;
                }

                __genRouter(server, pkgs[key], type, api.split('.')[0]);
            }
        }
    }

    const callback = __checkType(cb, 'function')
                ? cb : (_, adr) => !_ && console.log(`GledeServer is running at ${adr}`);

    server.listen({ port: opts.port, host: opts.host }, callback);
    server.ready(_ => {
        if (__checkType(server.swagger, 'function')) {
            __genInfoFile('apis.json', JSON.stringify(server.swagger(), null, 2), opts);
        }

        printRouters(opts);
    });
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

        const router = {
            method,
            schema,
            url: __genUrl(type, version, path, subpath),
            handler: __genRouterHandler(handler),
            onSend: __genRouterSend
        };

        app.route(router);
    }
}

function __genRouterHandler(handler) {
    return async function (req: FastifyRequest, res: FastifyReply) {
        if (!__preprocessRouter(req, res, handler)) {
            return;
        }

        const { body, params, query } = req;

        return handler.call(
            __genHandlerUtils(req, res),
            { body, params, query }
        );
    };
}

async function __genRouterSend(_, res, payload: string) {
    const code = res.statusCode;

    if (code === 401 || code >= 500) {
        return payload;
    }
    if (code < 200 || (code > 299 && code !== 304)) {
        if (!__checkType(payload, 'string')) {
            payload = '';
        }

        const result = payload.match(/"message":\s*"([\s\S]+)"/);
        const newPayload = {
            code: 1,
            data: null,
            msg: result && result[1] ? result[1] : ''
        };

        res.code(200);
        return JSON.stringify(newPayload);
    }
}

function __genInfoFile(filename: string, content: string, opts: GledeServerOpts) {
    writeFile(resolve(opts.infoDir, filename), content, _ => undefined);
}
