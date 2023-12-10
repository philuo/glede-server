/**
 * @file 请求页签插件
 * @date 2023-12-04
 * @author Perfumere
 */

import {
    __genSymbol,
    __checkType,
    __getToken,
    __isValidSign
} from '../utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function __preprocessSign(req: FastifyRequest, res: FastifyReply, handler) {
    if (!handler[__genSymbol('sign')]) {
        return true;
    }

    const [content, sign] = (req.headers['signature'] as string || '').split('.');

    if (!content || !sign) {
        return false;
    }

    // 验证页签是否有效
    return __isValidSign(req, content, sign);
}
