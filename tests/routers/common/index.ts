import { Get, Post, GledeRouter, NeedSign, GledeUtil, GledeStaticUtil } from '@/index';

const Schema = {
    summary: 'xx',
    description: 'xx',
    response: {
        type: 'object',
        properties: {
            pid: { type: 'integer' },
            cid: { type: 'integer' },
            zone: { type: 'string' },
            province: { type: 'string' },
            city: { type: 'string' },
            ips: { type: 'string' }
        }
    }
} as GledeGetSchema;

// const redis = GledeStaticUtil.getRedisInstance();
// const mongoose = GledeStaticUtil.getMongoInstance(); // !!!业务不推荐使用, 请保证仅在联调时充入数据使用

export class Router extends GledeRouter {
    @Get('/', { schema: Schema })
    @Post('/', { schema: Schema })
    @NeedSign()
    test(this: GledeThis, data) {
        console.log(data)
        return { code: 0, data: this.getRegion('39.107.94.26') };
    }

    @Get('/login')
    testLogin() {
        // const signature = GledeUtil.getSignUtil().sign();
        return {
            code: 0,
            data: {
                sign: GledeUtil.getSignUtil().sign()
            }
        };
    }
}
