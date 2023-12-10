/**
 * @file entry point of GledeServer plugins
 * @date 2022-06-27
 * @author Perfumere
 */

import { __preprocessCors } from './cors';
import { __preprocessAuth } from './auth';
// import { __preprocessSign } from './sign';
import type { FastifyRequest, FastifyReply } from 'fastify';

export * from './cors';
export { __preprocessSign } from './sign';

/**
 * 预处理请求
 * @param req FastifyRequest
 * @param res FastifyReply
 * @param handler FastifyRequestHandler
 * @returns 处理状态 成功true | 失败false
 */
export function __preprocessRouter(req: FastifyRequest, res: FastifyReply, handler) {
    // if (!__preprocessSign(req, res, handler)) {
    //     return false;
    // }
    if (!__preprocessAuth(req, res, handler)) {
        return false;
    }
    if (!__preprocessCors(req, res, handler)) {
        return false;
    }

    return true;
}
