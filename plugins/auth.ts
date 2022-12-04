/**
 * @file 路由鉴权插件
 * @date 2022-06-27
 * @author Perfumere
 */

import {
    __genSymbol,
    __checkType,
    __getToken,
    __getTokenUtil
} from '../utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * TODO: Token黑名单, 用于：收录超管手动添加及即将过期的Token, 并设置过期时间
 */
// const TOKEN_BLKLIST = 'blk_auth';

function __isValidToken(token: string, util: GledeTokenUtil, auth: number) {
    if (!token || !util) {
        return false;
    }

    const verfiyStatus = util.verify(token, auth);

    if (verfiyStatus !== 0 && verfiyStatus !== 1) {
        return false;
    }

    return true;
}

export function __preprocessAuth(req: FastifyRequest, res: FastifyReply, handler) {
    const auth = handler[__genSymbol('auth')];

    if (!__checkType(auth, 'number')) {
        return true;
    }

    return __isValidToken(__getToken(req), __getTokenUtil(), auth);
}
