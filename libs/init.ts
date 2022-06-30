/**
 * @file 服务器初始化
 * @date 2022-06-30
 * @author Perfumere
 */

import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { __gledeServer } from './base';
import { __registerRouter } from './route';
import { __mixinServerOpts, __initMongo, __initRedis } from '../utils';

function __mkDir(opts: GledeServerOpts) {
    let logDir = opts.logger && opts.logger.file ? dirname(opts.logger.file) : '';

    if (logDir && !existsSync(logDir)) {
        mkdirSync(logDir);
    }
}

function __initDatabase(opts: GledeServerOpts) {
    if (opts.redis) {
        __initRedis(opts.redis);
    }
    if (opts.mongodb) {
        __initMongo(opts.mongodb.url, opts.mongodb.options);
    }
}

export function Server(opts: GledeServerOpts, cb?: (err?: Error, address?: string) => void) {
    const options = __mixinServerOpts(opts);
    const server = __gledeServer(options);

    __initDatabase(options);
    __mkDir(options);
    __registerRouter(server, options, cb);

    return server;
}
