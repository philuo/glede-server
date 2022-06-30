/**
 * @file 跨域请求插件
 * @date 2022-06-27
 * @author Perfumere
 */

import { __genSymbol, __checkType } from '../utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

const CORS_ORIGIN = 'Access-Control-Allow-Origin';
const CORS_HEADER = 'Access-Control-Allow-Headers';
const CORS_METHOD = 'Access-Control-Allow-Methods';
const CORS_MAXAGE = 'Access-Control-Max-Age';
const CORS_CREDENTIAL = 'Access-Control-Allow-Credentials';

function __getOrigin(header: Record<string, string | string[]>) {
    if (__checkType(header.origin, 'string')) {
        return header.origin;
    }
    if (__checkType(header.referer, 'string')) {
        return new URL(header.referer as string).origin;
    }

    return '';
}

export function __preprocessCors(req: FastifyRequest, res: FastifyReply, handler) {
    const cors = handler[__genSymbol('cors')];

    if (__checkType(cors, 'array')) {
        /**
         * [CORS文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Access-Control-Max-Age)
         */
        res.header(CORS_HEADER, 'Content-Type,Cache-Control,Authorization,Origin');
        res.header(CORS_MAXAGE, 7200);
        const origin = __getOrigin(req.headers);

        for (const [key, value] of cors) {
            const target = value.toString();

            switch (key) {
                case 'origin': {
                    if (target === '*') {
                        res.header(CORS_ORIGIN, '*');
                    }
                    else if (target.includes(origin)) {
                        res.header(CORS_ORIGIN, origin);
                    }
                    else {
                        return false;
                    }

                    break;
                }
                case 'method': {
                    if (target.includes(req.method)) {
                        res.header(CORS_METHOD, req.method);
                    }
                    else {
                        return false;
                    }

                    break;
                }
                case 'credential': {
                    res.header(CORS_CREDENTIAL, 'true');
                }
            }
        }
    }

    return true;
}
