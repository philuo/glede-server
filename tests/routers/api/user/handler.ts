import { Post, GledeRouter } from '@/index';

export default class extends GledeRouter {
    @Post('/')
    login(this: GledeThis, data: GledeReqData): GledeResData {
        return {
            code: 0,
            data: null
        };
    }
}
