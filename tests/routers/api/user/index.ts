/**
 * @api 用户信息接口入口
 * @date 2022-06-27
 * @author Perfumere
 */

import { Get, Post, NeedAuth, GledeRouter, Cors } from '@/index';
import { allSchema, singleSchema } from './schema';
// import Cat from '@/tests/controllers/cat';

export class Router extends GledeRouter {
    @Get('/all', { schema: allSchema })
    getAll (this: GledeThis, data: GledeReqData) {
        // no return sames like follow:
        // return;
        // return null;
        // return undefined;
        // return { code: 0, data: null };
    }

    // /api/v1/user/:id
    @Cors('https://philuo.com')
    @Get('/:id', { schema: singleSchema, version: 'v1' })
    async getUserV1 (this: GledeThis, data: GledeReqData): Promise<GledeResData> {
        // this.setHeader('x-user-agent', 'wtf');
        // this.hasHeader('referer');
        // this.removeHeader('content-encoding');

        // 处理数据库操作
        // Cat.create({name: 1});
        // try {
        //     await Cat.create();
        // }
        // catch {
        //     // Handle db write error
        // }

        return {
            code: 0,
            data: {
                // ...
            }
        }
    }

    // /api/v2/user/:id
    @Get('/:id', { schema: singleSchema, version: 'v2' }) @NeedAuth('admin')
    getUserV2 (this: GledeThis, data: GledeReqData): GledeResData {
        // this.setHeader('x-user-agent', 'wtf');
        // this.hasHeader('referer');
        // this.removeHeader('content-encoding');

        return {
            code: 0,
            data: {
                // ...
            }
        }
    }
}

export * from './handler';
