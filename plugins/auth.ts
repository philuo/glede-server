/**
 * @file 路由鉴权插件
 * @date 2022-06-27
 * @author Perfumere
 */

import {
    __genSymbol,
    __checkType,
    __getToken,
    __isValidToken
} from '../utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * TODO: Token黑名单, 用于：收录超管手动添加及即将过期的Token, 并设置过期时间
 */
// const TOKEN_BLKLIST = 'blk_auth';
export function __preprocessAuth(req: FastifyRequest, res: FastifyReply, handler) {
    const auth = handler[__genSymbol('auth')];
    const token = __getToken(req);

    if (!__checkType(auth, 'number')) {
        return true;
    }
    if (!token) {
        return false;
    }

    return __isValidToken(req, token, auth);
}
