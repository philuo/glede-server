/**
 * @file Token鉴权工具
 * @date 2022-06-29
 * @author Perfumere
 */

import { createHmac } from 'crypto';
import type { FastifyRequest } from 'fastify';

function __serialize(content: GledeTokenPayload) {
    return Buffer.from(JSON.stringify(content)).toString('base64url');
}

export function __unserialize(content: string): GledeTokenPayload {
    try {
        return JSON.parse(Buffer.from(content, 'base64url').toString());
    }
    catch (err) {
        return null;
    }
}

function __signature(content: string, salt: string) {
    return createHmac('sha256', salt).update(content).digest('base64url');
}

/**
 * token校验
 * @param token 身份令牌
 * 0、1验证通过, 1表示token即将过期
 * 
 * 2~6验证失败, 2解析错误, 3未生效, 4已失效, 5已篡改, 6权限不足
 */
function __verify(
    content,
    sign,
    payload,
    salt: string,
    period: number,
    level: number
) {
    // 载体解析错误
    if (!payload) {
        return 2;
    }

    const { exp, nbf, role } = payload;
    const now = Math.trunc(Date.now() / 1000);

    if (role > level) {
        return 6;
    }

    // 有效时间范围：exp(失效时间点) >= now >= nbf(生效时间点)
    if (nbf && nbf > now) {
        return 3;
    }
    if (!exp || now > exp) {
        return 4;
    }

    // 即将过期
    let willExp = false;
    if (exp - now < period / 6 || exp - now < 100) {
        willExp = true;
    }

    // 检测篡改
    if (sign !== __signature(content, salt)) {
        return 5;
    }

    if (willExp) {
        return 1;
    }

    return 0;
}

export function createTokenUtil(opts: GledeTokenOpts) {
    const { salt, period = 3600 } = opts;

    return {
        sign(payload?: GledeTokenPayload) {
            const curSecond = Math.trunc(Date.now() / 1000);

            const content = __serialize({
                nbf: curSecond,
                exp: curSecond + period,
                role: 3,
                ...payload,
            });

            return `${content}.${__signature(content, salt)}`;
        },
        verify(token, role) {
            const [content, sign] = token.split('.');

            return __verify(
                content,
                sign,
                __unserialize(content),
                salt, 
                period,
                role
            );
        }
    };
}

export function __isValidToken(req: FastifyRequest, token: string, auth: number) {
    if (!tokenOpts) {
        return false;
    }

    const [content, sign] = token.split('.');
    const payload = __unserialize(content);
    const code = __verify(
        content,
        sign,
        payload,
        tokenOpts.salt, 
        tokenOpts.period,
        auth
    );

    if (code === 0 || code === 1) {
        const data = { token, payload };

        if (req.method === 'GET') {
            req.query['_token'] = data;
        }
        else if (req.method === 'POST' && req.body) {
            req.body['_token'] = data;
        }

        return true;
    }

    return false;
}

let tokenUtil: GledeTokenUtil;
let tokenOpts: GledeTokenOpts;
export function __getTokenUtil() {
    return tokenUtil;
}

export function __genTokenUtil(opts: GledeServerOpts) {
    if (!tokenUtil) {
        tokenOpts = opts.token;
        tokenUtil = createTokenUtil(tokenOpts);
    }

    return tokenUtil;
}
