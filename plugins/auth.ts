/**
 * @file 路由鉴权插件
 * @date 2022-06-27
 * @author Perfumere
 */

import { __genSymbol, __checkType } from '../libs/util';
import type { FastifyRequest, FastifyReply } from 'fastify';

const authRole = ['root', 'super', 'admin', 'user'];

export function __preprocessAuth(req: FastifyRequest, res: FastifyReply, handler) {
    const auth = handler[__genSymbol('auth')];

    if (__checkType(auth, 'string') && authRole.includes(auth)) {
        // TODO
        // req.headers['authorization']

        // return false;
    }

    return true;
}
