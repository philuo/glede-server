/**
 * @file Sign校验工具
 * @date 2022-06-29
 * @author Perfumere
 */

import { createHash } from 'crypto';
import { __throwError } from './util';
import type { FastifyRequest } from 'fastify';

function toBase64(content: string) {
    return Buffer.from(content).toString('base64');
}

function fromBase64(content: string): string {
    return Buffer.from(content, 'base64').toString();
}

function __signature(content: string, salt: string) {
    return createHash('sha1').update(content + salt).digest('base64url');
}

function __checkSign(content: string) {
    return createHash('sha1').update(content).digest('hex');
}

/**
 * sign校验
 * @param sign 签名令牌
 * 0、1验证通过, 1表示token即将过期
 * 
 * 2~5验证失败, 2解析错误, 4已失效, 5已篡改
 */
function __verify(
    content: string,
    sign: string,
    baseKey: string,
    salt: string,
    period: number
) {
    const exp = Number(content.split('_')[0]);

    if (!exp) {
        return 2;
    }

    const now = Date.now();

    if (now > exp) {
        return 4;
    }

    // 即将过期
    let willExp = false;
    if (exp - now < period / 6 || exp - now < 100) {
        willExp = true;
    }

    // 检测篡改
    if (sign !== __signature(content, baseKey + salt)) {
        return 5;
    }

    if (willExp) {
        return 1;
    }

    return 0;
}


function __sign(period: number, baseKey: string, salt: string) {
    const exp = Date.now() + period * 1000;
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    const oriStr = `${exp}_${randomNum}`;
    const base64OriStr = toBase64(oriStr);

    return `${base64OriStr}.${__signature(oriStr, baseKey + salt)}`;
}

export function createSignUtil(opts: GledeSignOpts) {
    const { salt, key, period } = opts;

    if (!salt) {
        __throwError('createSignUtil need params.salt');
    }

    return {
        sign() {
            if (!Number.isInteger(period)) {
                __throwError('createSignUtil() param period need a integer');
            }
            if (isNaN(period) || period <= 0) {
                __throwError('createSignUtil().sign receive invalid params');
            }

            return __sign(period, key, salt);
        },
        verify(str: string) {
            if (typeof str !== 'string') {
                __throwError('createSignUtil().verify receive invalid params');
            }

            const [content, sign] = str.split('.');

            if (!content || !sign) {
                __throwError('createSignUtil().verify receive invalid params');
            }

            return __verify(
                fromBase64(content),
                sign,
                key,
                salt,
                period
            );
        }
    };
}

export function __isValidSign(req: FastifyRequest, content: string, sign: string) {
    content = fromBase64(content);
    const exp = Number(content.split('_')[0]);

    if (!exp || Date.now() >= exp) {
        return false;
    }

    let payload = '';
    const head = `${req.method} ${req.url}`;

    if (req.method === 'POST') {
        payload = req.body instanceof Object ? JSON.stringify(req.body) : req.body as string;
    }

    const { key: baseKey = '', salt, period } = signOpts;
    const checkKey = __signature(content, baseKey + salt);

    return sign === __checkSign(checkKey + baseKey + head + payload);
}

let signUtil: GledeSignUtil;
let signOpts: GledeSignOpts;
export function __getSignUtil() {
    return signUtil;
}

export function __genSignUtil(opts: GledeServerOpts) {
    if (!signUtil) {
        signOpts = opts.sign;

        if (!signOpts) {
            signOpts = {} as GledeSignOpts;
        }
        if (!signOpts.key) {
            signOpts.key = '';
        }
        if (!signOpts.period) {
            signOpts.period = 3600;
        }

        signUtil = createSignUtil(signOpts);
    }

    return signUtil;
}
