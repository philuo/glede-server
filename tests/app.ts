/**
 * @file 测试入口
 * @date 2022-06-27
 * @author Perfumere
 */

import { Server, GledeUtil, GledeStaticUtil } from '@/index';
import { serviceEntry } from '#/components/service/entry';
// import Cat from './controllers/cat';

// initialize common utils
serviceEntry();

// const app = Server({ conf: 'tests/configs/app.json' });
const app = Server({ conf: 'tests/configs/app-config.ts' });

// After Server is start
// GledeStaticUtil.getMongoInstance(); // 获取Mongoose实例
// GledeStaticUtil.getRedisInstance(); // 获取Redis实例
// Cat.create({ name: 'cool_dog', age: 1 });
// Cat.findByName('^cool');
// Cat.findOne().then(res => console.log(res));
// GledeStaticUtil.schedule('*/5 * * * * *', () => console.log('memory usage: ' + process.memoryUsage()));
// GledeStaticUtil.schedule('*/2 * * * * *', './tests/crons/test.ts');

// On Server is running
// GledeUtil.sendMail({                // 发送邮件
//     to: 'a@qq.com,b@163.com',
//     subject: '主题',
//     html: '<img src="https://plog.top/favicon.ico">'
// });
// GledeUtil.getTokenUtil();

app.addHook('onError', () => {
    console.log('server should be closed');
});
