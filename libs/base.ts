/**
 * @file 服务器实例
 * @date 2022-06-26
 * @author Perfumere
 */

import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

/**
 * 创建Server单例
 * @param opts Server配置
 * @returns GledeServerInstance
 */
export function __gledeServer(opts: GledeServerOpts) {
    if (app) {
        return app;
    }

    return app = fastify({ logger: opts.logger });
}

/**
 * 获取Glede实例
 * @returns GledeServerInstance
 */
export function getServerInstance() {
    return app ? app : null;
}

/**
 * [路由基类](https://www.fastify.cn/docs/latest/Routes/)
 */
export abstract class GledeRouter {
    readonly [prop: string]: (this: GledeThis, data: GledeReqData) => GledeResData | Promise<GledeResData>
        | void | Promise<void>;
}

// export global variable GSD
global.GSD = global.GSD || {} as any;
global.GSD.GledeRouter = GledeRouter;
