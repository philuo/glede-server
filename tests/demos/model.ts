/**
 * @file Demo: Cat Model
 * @date 2022-06-30
 * @author Perfumere
 */

import { Model, GledeStaticUtil } from 'glede-server';
import User from '@/controllers/user';
import type { LuaRedis } from '@/types/redis-lua';

const CatSchema = {
    name: { type: String, required: true },
    age: Number
};

const CatOpts = {
    // 指定集合名, 此时集合链接到了cat, 默认是cats
    collection: 'cat',

    // 添加便捷方法, 注意不要使用箭头函数！
    // 可以这样使用：Cat.findByName('^cool').then(res => {});
    statics: {
        findByName(name: string) {
            return this.find({ name: new RegExp(name, 'i') });
        }
    }
};

// 测试自定义redis指令
const redis = GledeStaticUtil.getRedisInstance() as LuaRedis;

function processStat(result: any[]) {
    const arr = [];
    const defaultStat = {
        view: 0,
        share: 0,
        comment: 0,
        reply: 0,
        like: 0,
        star: 0
    };

    for (const item of result) {
        if (!item.length) {
            arr.push(defaultStat);
            continue;
        }
        
        const stat = {};

        for (let i = 0; i < item.length; i += 2) {
            stat[item[i]] = Number(item[i + 1]);
        }

        arr.push(stat);
    }

    return arr;
}

// 连表查询demo
// const list2 = await DynCmnt.find(
//     { dynId, _id: { $lt: ObjectId(lastId || null) } },
//     undefined,
//     { sort: { _id: -1 }, limit: quantity }
// ).populate({
//     path: 'uid',
//     select: {
//         _id: 0,
//         uid: '$_id',
//         avatar: 1,
//         nickname: 1,
//         college: 1,
//         stat: 1,
//         auth: 1
//     }
// });

// User.updateOne(
//     { _id: 1494 },
//     { $inc: { 'stat.dyn': 1 } }
// ).then(res => {
//     console.log(res);
// });

export default Model('cat', CatSchema, CatOpts);
