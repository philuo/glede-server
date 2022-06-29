/**
 * @api 用户信息接口入口
 * @date 2022-06-27
 * @author Perfumere
 */

import { Get, Post, NeedAuth, GledeRouter, Cors } from '@/index';
import { allSchema, singleSchema } from './schema';
// import Cat from '@/tests/controllers/cat';

export class Router extends GledeRouter {
    @Get('/all', { schema: allSchema }) @NeedAuth('super')
    getAll (this: GledeUtil, data: GledeReqData): GledeResData {
        return {
            code: 0,
            data: {
                list: [
                    // ...
                ]
            }
        }
    }

    // /api/v1/user/:id
    @Get('/:id', { schema: singleSchema, version: 'v1' }) @NeedAuth('noauth')
    async getUserV1 (this: GledeUtil, data: GledeReqData): Promise<GledeResData> {
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
    getUserV2 (this: GledeUtil, data: GledeReqData): GledeResData {
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
