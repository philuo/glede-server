/**
 * @file 猫类数据模型
 * @date 2022-06-28
 * @author Perfumere
 */
import { Model } from '@/index';

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

export default Model('cat', CatSchema, CatOpts);
