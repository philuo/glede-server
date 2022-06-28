/**
 * @file 服务器配置
 * @date 2022-06-28
 * @author Perfumere
 */

'use strict';

const {
    /**
     * Redis 鉴权信息
     */
    REDIS_AUTH,

    /**
     * MongoDB 鉴权信息
     */
    MONGO_USER,
    MONGO_AUTH
} = process.env;

export default {
    host: '0.0.0.0',
    port: 3020,
    logger: {
        level: 'error',
        file: 'tests/logs/error.log'
    },
    routerDir: 'tests/routers',
    infoDir: 'tests/logs',
    apiDocs: {
        openapi: {
            info: {
                title: 'happy-pub-server API',
                description: '泡泡校园业务API',
                version: '1.0.0'
            },
            externalDocs: {
                url: 'https://plog.top',
                description: '访问预发布环境'
            },
            servers: [
                {
                    url: 'http://localhost:3020'
                },
                {
                    url: 'https://app.plog.top'
                }
            ],
            schemes: ['http', 'https'],
            consumes: ['application/json'],
            produces: ['application/json']
        },
        hideUntagged: false
    },
    redis: {
        password: REDIS_AUTH
    },
    mongodb: {
        url: `mongodb://${MONGO_USER}:${MONGO_AUTH}@127.0.0.1:27017/localService`
    }
};
