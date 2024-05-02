/**
 * @file Decorator of GledeRouter
 * @date 2022-06-24
 * @author Perfumere
 */

import {
    __genSymbol,
    __genSchema,
    __throwError,
    __checkType
} from '../utils';

const __methodOpts = { version: '' };
const authRole = ['root', 'super', 'admin', 'user', 'noauth'];

/**
 * 设置身份鉴权
 */
function NeedAuth(level: GledeAuthLevel) {
    const authSymbol = __genSymbol('auth');

    return function (target, name) {
        if (target[name][authSymbol]) {
            __throwError(`@NeedAuth has already exists on handler ${name}`);
        }

        const index = authRole.indexOf(level);

        if (!~index) {
            __throwError(`@NeedAuth receive error role on handler ${name}`);
        }
        if (!level || level === 'noauth') {
            return;
        }

        target[name][authSymbol] = index;
    }
}

/**
 * Post请求体加签验证
 */
function NeedSign() {
    const signSymbol = __genSymbol('sign');

    return function (target, name) {
        if (target[name][signSymbol]) {
            __throwError(`@NeedAuth has already exists on handler ${name}`);
        }

        target[name][signSymbol] = signSymbol;
    } 
}

/**
 * TODO: 性能录制
 */
function PerfRec() {

}

/**
 * TODO: 应用层安全设置
 */
function Safe() {

}

/**
 * [设置跨域资源共享](https://www.php.cn/manual/view/35589.html)
 * @param origin Access-Control-Allow-Origin; Default: *
 * @param method Access-Control-Allow-Methods; Default: `GET,POST`
 * @param credential Access-Control-Allow-Credentials; `设置此项时要求origin 不能为 *`
 */
function Cors(
    origin: string | string[] = '*',
    method = 'GET,POST',
    credential?: boolean
) {
    const corsSymbol = __genSymbol('cors');

    return function (target, name) {
        if (credential && origin.toString().trim() === '*') {
            __throwError(`@Cors add credential with error origin`);
        }

        let corsOpts = target[name][corsSymbol];

        if (corsOpts) {
            __throwError(`@Cors has already exists on handler ${name}`)
        }
        else {
            corsOpts = [];
        }

        if (method && __checkType(method, 'string')) {
            corsOpts.push(['method', `${method},OPTIONS`]);
        }
        if (credential && __checkType(credential, 'boolean')) {
            corsOpts.push(['credential', true]);
        }

        if (__checkType(origin, 'string')) {
            corsOpts.push(['origin', [origin]]);
        }
        else if (__checkType(origin, 'array')) {
            corsOpts.push(['origin', origin]);
        }

        target[name][corsSymbol] = corsOpts;
    }
}

function __methodReturnCb(
    method: GledeSupportMethod,
    subpath: string,
    { version = '', schema }: GledeMethodOpts
) {
    const symbolKey = __genSymbol(`${method}:${subpath}:${version}`);

    return function (target, name) {
        if (!target[symbolKey]) {
            target[symbolKey] = {
                subpath,
                version,
                schema: __genSchema(schema),
                method,
                handler: target[name]
            };
        }
        else if (!target[symbolKey].method.includes(method)) {
            target[symbolKey].method = [target[symbolKey].method, method];

            if (__checkType(schema, 'object')) {
                target[symbolKey].schema = __genSchema({
                    ...schema,
                    ...target[symbolKey].schema
                });
            }
        }
        else {
            __throwError(`router ${subpath} had already registered on handler ${name}`);
        }
    }
}

/**
 * GET方法装饰器
 * @param subpath 路径名, 不要带/
 * @param options GledeGetMethodOpts:`{version, schema}`
 * 
 * `version = v1 -> /v1/path/subpath`
 *
 * `version = v1 -> /api/v1/path/subpath`
 * 
 * `version = '' -> /path/subpath`
 * 
 * `version = '' -> /openapi/path/subpath`
 * 
 */
function Get(
    subpath: string,
    options: GledeGetMethodOpts = __methodOpts
) {
    return __methodReturnCb('GET', subpath, options);
}

/**
 * POST方法装饰器
 * @param subpath 路径名, 不要带/
 * @param options GledeGetMethodOpts:`{version, schema}`
 * 
 * `version = v1 -> /v1/path/subpath`
 *
 * `version = v1 -> /api/v1/path/subpath`
 * 
 * `version = '' -> /path/subpath`
 * 
 * `version = '' -> /openapi/path/subpath`
 */
function Post(
    subpath: string,
    options: GledePostMethodOpts = __methodOpts
) {
    return __methodReturnCb('POST', subpath, options);
}

// export global variable GSD
global.GSD = global.GSD || {} as any;
global.GSD.Get = Get;
global.GSD.Post = Post;
global.GSD.Cors = Cors;
global.GSD.NeedAuth = NeedAuth;
global.GSD.NeedSign = NeedSign;

export {
  Get,
  Post,
  Cors,
  NeedAuth,
  NeedSign
};
