/**
 * @file 邮件发送工具
 * @date 2022-06-30
 * @author Perfumere
 */

import { createTransport } from 'nodemailer';
import { getRedisInstance } from './db';
import { __checkType, __throwError } from './util';

/** 记录的周期时长24h */
const TTL = 3600 * 24;
const PREFIX = '!count_';
let mailer;
let mailerList = [] as GledeServerOpts['mailer'];
let mailerState = {
    remain: 0,
    cursor: -1
};

/**
 * 初始化GledeMailer
 */
export function __genMailer(opts: GledeServerOpts) {
    if (!__checkType(opts.mailer, 'array')) {
        __throwError('__genMailer receives error params');
    }

    mailerList = opts.mailer;
    __checkoutMailer(mailerList);
}

/**
 * 发送邮件, 运行时方法
 */
export async function sendMail(message: GledeMailMessage) {
    if (!__checkType(message, 'object')) {
        __throwError('sendMail receives error params');
    }
    if (!mailer || !mailerList.length) {
        __throwError('sendMail mailer is not exists');
    }

    const { user } = await __checkoutMailer(mailerList);

    return await mailer.sendMail({
        from: user,
        ...message
    });
}

/**
 * 创建Mailer
 */
const outMailer = {} as Record<string, GledeServerOpts['mailer']>;
export function createMailer(opts: GledeMailerOpts) {
    if (!__checkType(opts.user, 'string')) {
        __throwError('createMailer receives error params');
    }

    if (outMailer[opts.user]) {
        return outMailer[opts.user];
    }

    const { host, user, pass } = opts;

    return outMailer[opts.user] = __createTransport(host, user, pass);
}

async function __checkoutMailer(list) {
    const client = getRedisInstance();

    if (!client) {
        __throwError('__checkMailer is based on redis connection');
    }

    if (mailerState.cursor !== -1 && mailerState.remain > 0) {
        return list[mailerState.cursor];
    }

    for (let index = 0; index < list.length; index += 1) {
        const mailer = list[index];
        const countKey = PREFIX + mailer.user;
        const count = Number(await client.get(countKey) || 0);

        if (count < mailer.nums) {
            /**
             * -1 永久存在 | -2 不存在 | 0~n 剩余生存时长
             */
            const mttl = await client.ttl(countKey);
            client.set(countKey, count, 'EX', mttl !== -2 ? mttl : TTL);
            mailerState.cursor = index;
            mailerState.remain = mailer.nums - count;

            break;
        }
    }

    if (mailerState.cursor === -1) {
        __throwError('__checkMailer has already worn-out');
    }

    const { host, user, pass } = list[mailerState.cursor];
    mailer = __createTransport(host, user, pass);

    return list[mailerState.cursor];
}

function __createTransport(host: string, user: string, pass: string) {
    return createTransport({
        host,
        port: 465,
        secureConnection: true,
        secure: true,
        auth: { user, pass }
    });
}
