/**
 * @file 猫类数据模型
 * @date 2022-06-28
 * @author Perfumere
 */
import { Model, GledeStaticUtil } from '@/index';
import { LuaRedis } from '@/tests/types/redis-lua';

// !注意: 这里需要使用自定义redis指令
const redis = GledeStaticUtil.getRedisInstance() as LuaRedis;

const CatSchema = {
    name: { type: String, required: true },
    age: Number
};

const CatUtil = {
    // 指定集合名, 此时集合链接到了cat, 默认是cats
    collection: 'cat',

    // 添加便捷方法, 注意不要使用箭头函数！
    // 可以这样使用：Cat.findByName('^cool').then(res => {});
    statics: {
        findByName(name: string) {
            return this.find({ name: new RegExp(name, 'i') });
        },

        async getStatList(ids: string[]) {
            const list = await redis.statList('_dynstat', ...ids);
            const arr = [] as Record<string, number>[];

            for (const item of list) {
                const stat = {} as Record<string, number>;
        
                for (let i = 0; i < item.length; i += 2) {
                    stat[item[i]] = Number(item[i + 1]);
                }
        
                arr.push(stat);
            }

            return arr;
        },
    }
};

// 注意⚠️：一定要定义引用后导出, 不然可能存在Model重复定义而报错。这个具体的JS/TS解释器有关。
const Cat = Model('cat', CatSchema, CatUtil);

export default Cat;
