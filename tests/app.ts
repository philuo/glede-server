/**
 * @file 测试入口
 * @date 2022-06-27
 * @author Perfumere
 */

import { Server } from '../index';
import Cat from './controllers/cat';

// Cat.create({ name: 'cool_dog', age: 1 });
// Cat.findByName('^cool');
// Cat.findOne().then(res => console.log(res));

// const app = Server({ conf: 'tests/configs/app.json' });
const app = Server({ conf: 'tests/configs/app-config.ts' });

app.addHook('onClose', () => {
    console.log('server should be closed');
});
