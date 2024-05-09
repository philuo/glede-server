/**
 * @file 通用工具库
 * @date 2022-06-25
 * @author Perfumere
 */

import { readFileSync } from 'fs';
import { join, resolve } from 'path';
// @ts-ignore
import { customAlphabet } from 'nanoid';

/**
 * HTTP通信 [JSON校验](https://json-schema.apifox.cn/#数据类型)
 * 
 * [已支持的类型校验](../types/index.d.ts)
 */
export function __genSchema(schema: any) {
    if (!schema) {
        return;
    }

    if (schema.response) {
        schema.response = {
            200: {
                type: 'object',
                properties: {
                    code: {
                        title: '状态码',
                        description: '0 正常 | 1 参数校验错误 | >= 2 自定义错误',
                        type: 'integer'
                    },
                    data: {
                        description: '响应的数据结构, code > 0 时值必须为null',
                        oneOf: [
                            { ...schema.response },
                            { type: 'null' }
                        ]
                    },
                    msg: {
                        description: 'code > 0 必选, 用来描述错误信息, 📢不要暴露服务器的敏感处理流程',
                        type: 'string'
                    }
                },
                required: ['code', 'data']
            }
        };
    }

    return schema;
}

export function __throwError(message: string) {
    throw new Error(`GledeServer: ${message}`);
}

export function __genSymbol(str: string) {
    return Symbol.for(`@@${str}__`);
}

export function __getSymbols(target: any) {
    if (!__checkType(target, 'object')) {
        return [];
    }

    return Object.getOwnPropertySymbols(target).filter(item => {
        const key = Symbol.keyFor(item);

        if (!key) {
            return false;
        }

        return key.startsWith('@@') && key.endsWith('__');
    });
}

export function __mixinServerOpts(opts: GledeServerOpts) {
    const options = Object.assign({}, opts);

    if (__checkType(options.conf, 'string')) {
        try {
            if (options.conf.endsWith('.json')) {
                Object.assign(options, JSON.parse(readFileSync(options.conf, 'utf-8')));
            }
            else if (options.conf.endsWith('.ts') || options.conf.endsWith('.js')) {
                Object.assign(options, require(resolve(options.conf)).default);
            }

            Reflect.deleteProperty(options, 'conf');
        }
        catch {
            __throwError('cannot open config file');
        }
    }
    if (!__checkType(options.routerDir, 'string')) {
        options.routerDir = 'routers';
    }
    if (__checkType(options.logger, 'undefined')) {
        options.logger = false;
    }

    options.appConf = options.appConf || {} as GledeServerOpts['appConf'];
    options.appConf.logger = options.logger;
    options.host = options.host || '0.0.0.0';

    return options;
}

export function __genUrl(
    type: string,
    version: string,
    path: string,
    subpath: string
) {
    return join('/', type, version, path, subpath).replace(/\\/g, '/');
}

/**
 * @function 检测类型
 * @param {*} target 待检测的数据
 * @param {string} type 期望的类型
 * null、undefined、boolean、string、number、set、map、
 * object、symbol、array、function、bigint、weakmap、weakset
 */
export function __checkType(target: any, type: string) {
    if (type !== 'object' && typeof target === type) {
        return true;
    }

    return `[object ${type}]` === Object.prototype.toString.call(target).toLowerCase();
}

const _alphabetDict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const _alphabet = customAlphabet(_alphabetDict, 11);
const _lowerChar = customAlphabet('abcdefghijklmnopqrstuvwxyz', 1);

/**
 * 生成随机文件名, 保证第一位是小写字母
 */
export function __genRandomFilename(size: number = 12) {
    if (size === 12) {
        return _lowerChar() + _alphabet();
    }

    return _lowerChar() + customAlphabet(_alphabetDict, size - 1)();
}
