/**
 * @file 数据库事务用例
 * @date 2022-07-05
 * @author Perfumere
 */

import { Transaction } from 'glede-server';
import Cat from '#/controllers/cat';

/**
 * 注意：事务执行依赖的集合需要事先存在, 否则会抛异常。
 * 事务中使用插入操作是比较慢的, 有多慢呢？
 */

// 事务1: CRUD操作无依赖顺序, 必须全部成功或者全部失败

async function crudSet1 (session) {
    /** 插入是很慢的, 所以大概率事务2先于事务1执行完成, 事务2中删除(await Cat.deleteMany)就没有实现预期效果 */
    const p1 = Cat.create([{ name: 'philer_1', age: 1 }], { session });
    const p2 = Cat.findOne({}, null, { session });

    // 尽量使用bulkWrite, 此处是不同集合或不同数据库的实现示例之一
    await Promise.all([p1, p2]);
}


// 事务2: CRUD操作有依赖顺序, 必须全部成功或者全部失败
async function crudSet2 (session) {
    await Cat.findOne({}, null, { session });
}

(async () => {
    let now = Date.now();
    let count = 0;

    /** 2千万qps, 所以忽略条件耗时 */
    const catInstance = { name: 'kitty' };

    /** 8K 单集合文档数量CRUD测试 */
    while (Date.now() - now <= 1000) {
        count += 1;
        /** 查找 */
        // await Cat.findOne(null);                         // 1700 ~ 1900 qps
        // await Cat.find({ name: 'philer_1' });            // 300 ~ 500 qps, 时长依赖查询到的文档结果

        /** 计数 */
        // await Cat.count({ name: 'philer_1' });           // 300 ~ 500 qps, 时长依赖查询到的文档结果
        // await Cat.count();                               // 2800 ~ 3000 qps, 时长依赖查询到的文档结果
        // await Cat.estimatedDocumentCount();              // 3000 ~ 3200 qps, 时长依赖查询到的文档结果

        /** 计数 */
        // await Cat.deleteOne({ name: 'philer_1' });       // 400 ~ 450 qps
        // await Cat.deleteMany({ name: 'philer_1' });      // 400 ~ 450 qps
        // await Cat.create({ name: 'philer_1' });          // 1200 ~ 1400 qps
        // await Cat.create([catInstance, catInstance, catInstance]);  // 700 ~ 750 qps
        // await Cat.updateOne(catInstance, { age: 1 });    // 1600 ~ 1900 qps, 时长依赖查询到的文档结果
        // await Cat.updateMany(catInstance, { age: 1 });   // 50 ~ 100 qps, 时长依赖查询到的文档结果

        /** 事务 */
        // await Transaction(crudSet1);                     // 650 ~ 700 qps
        // await Transaction(crudSet2);                     // 1000 ~ 1100 qps
    }

    console.log(count);
})();
