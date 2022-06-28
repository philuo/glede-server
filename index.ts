/**
 * @file GledeServer Based on Fastify
 * @date 2022-06-25
 * @author Perfumere
 */

import { __gledeServer } from './libs/base';
import { __registerRouter } from './libs/route';
import { __mkDir, __mixinServerOpts, __initDatabase } from './libs/util';

export function Server(opts: GledeServerOpts, cb?: (err?: Error, address?: string) => void) {
    const options = __mixinServerOpts(opts);
    const server = __gledeServer(options);

    __initDatabase(options);
    __mkDir(options);
    __registerRouter(server, options, cb);

    return server;
}

export { GledeRouter, getServerInstance } from './libs/base';
export { printRouters } from './libs/route';
export { Get, Post, Cors, NeedAuth } from './libs/decorator';
export { Model, getMongoInstance, getRedisInstance } from './libs/db';
