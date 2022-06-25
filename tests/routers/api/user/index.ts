/**
 * @api 用户信息接口入口
 * @date 2022-06-27
 * @author Perfumere
 */

import { Get, NeedAuth, GledeRouter } from '@/index';
import { allSchema, singleSchema } from './schema';

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

    @Get('/:id', { schema: singleSchema }) @NeedAuth('admin')
    getUser (this: GledeUtil, data: GledeReqData): GledeResData {
        return {
            code: 0,
            data: {
                // ...
            }
        }
    }
}

export * from './handler';
