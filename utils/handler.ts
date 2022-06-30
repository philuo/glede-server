/**
 * @file RouterHandler工具
 * @date 2022-06-30
 * @author Perfumere
 */

import IpReader from '@yuo/ip2region';
import { getRedisInstance } from './db';
import { __checkType } from './util';
import { __unserialize } from './token';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function __getIp(req: FastifyRequest) {
    if (req.headers['x-real-ip']) {
        return req.headers['x-real-ip'] as string;
    }
    if (__checkType(req.ip, 'string')) {
        return req.ip.split(':').slice(-1)[0];
    }
}

export function __getToken(req: FastifyRequest) {
    if (!req.headers.authorization) {
        return '';
    }

    return req.headers.authorization.substring(7);
}

export function __genReqUtils(req: FastifyRequest) {
    return {
        getIp() {
            return __getIp(req);
        },
        getRegion(ip?: string) {
            IpReader(ip || __getIp(req))
        },
        getToken() {
            return __unserialize(__getToken(req).split('.')[0]);
        },
        getHeader(key: string) {
            return req.headers[key];
        },
        getHeaders() {
            return req.headers;
        }
    };
};

export function __genHandlerUtils(req: FastifyRequest, res: FastifyReply) {
    return {
        ...__genReqUtils(req),
        mq: getRedisInstance(),
        hasHeader: res.hasHeader.bind(res),
        setHeader: res.header.bind(res),
        removeHeader: res.removeHeader.bind(res)
    };
}
