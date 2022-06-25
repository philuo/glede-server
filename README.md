# GledeServer

## Server Based on Fastify

## 注意事项

### 基于配置启动

```ts
// types/index.d.ts 有详细的描述,手写配置会覆盖conf文件中的对应字段
// 优先级：代码中手写配置 > conf字段文件配置
interface GledeServerOpts {
    // ...
}

// app.ts
import { Server } from '@yuo/glede-server';

Server({ conf: 'configs/app.json' }, (err, address) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`GledeServer is running at ${address}`);
    }
});
```

### 路由类

```ts
import {
    GledeRouter,
    Get,
    Post
} from '@yuo/glede-server';

// routers/api/user/index.ts
export class Router extends GledeRouter {
    // 注意方法不要使用箭头函数
    // 1. 依赖原型处理逻辑; 2. 注入依赖工具方便处理请求

    getAllUser(this: GledeUtil, data: GledeReqData) {
        // doSomething.

        if (noPass) {
            return {
                // 1 客户端参数校验未通过, 业务无需关心
                // >= 2 自定义
                code: 2,
                data: null,
                msg: '描述错误原因'
            };
        }

        return {
            code: 0, // 0 处理成功
            data: {
                // ...
            }
        };
    }
}
```

### 单例模式

目前单个项目中只能创建一个Server实例, 暂时无mono-repo的要求。

若后续使用mono-repo, 则考虑新增配置 `basePath: ''`, 
路由注册、日志记录、文档校验、数据库等操作基于`basePath`

### 默认记录错误日志

- 默认记录日志, 需要创建对应的目录路径
- 根目录创建文件: logs/error.log

### 请求需通过Schema校验

- 手动创建Schema
- [Schema校验采用Ajv6](https://github.com/fastify/docs-chinese/blob/master/docs/Validation-and-Serialization.md)

```ts
// 新建或修改路由文件
// mkdir routers/${api | openapi}/${router | routerDir/index.ts}
// api|openapi目录下存放路由可以是ts文件或目录, 文件内和目录内的Schema定义可相互引用
// 示例 /routers/api/user/index.ts
import {
    getAllUsersSchema,
    getAllUsersSchemaV2,
} from './schema';

export Router extends GledeRouter {
    // version是接口的版本用于线上并行, 可选：默认 '', 如果出现版本区分可填写 v1, v2, ...
    // schema是参数的拦截校验, 必选：1. 客户端字段安全拦截 2. 增加序列化的性能10%~15% 3. 生成接口文档协同开发
    // match: /api/v1/:id
    @Get('/:id', { version: 'v1', schema: getAllUsersSchema }) @Cors()
    getAllUsers(this: GledeUtil, data: GledeReqData): GledeResData {
        return {
            code: 0,
            data: {
                // ...
            }
        }; 
    }

    @Get('/:id', { version: 'v2', schema: getAllUsersSchemaV2 })
    @Post('/:id', { schema})
    @NeedAuth('super') @Cors('https://philuo.com', 'GET,POST')
    getAllUsersV2(this: GledeUtil, data: GledeReqData): GledeResData {
        return {
            code: 0,
            data: {
                // ...
            }
        };
    }
}
```
