/**
 * @file 用户信息Schema
 * @date 2022-06-27
 * @author Perfumere
 */

export const allSchema = {
    summary: '获取全部用户摘要列表',
    description: '超管权限接口, 获取全部信息',
    query: {
        type: 'object',
        properties: {
            name: {
                title: '用户名字',
                description: '用于判定xx',
                type: 'integer'
            }
        },
        required: ['test']
    },
    response: {
        type: 'object',
        properties: {
            list: {
                title: '用户列表信息',
                description: '用户Id,...',
                type: 'array'
            }
        },
        required: ['list']
    }
} as GledeGetSchema;

export const singleSchema = {
    summary: '获取指定用户摘要列表',
    description: '管理员权限接口, 获取指定用户的非敏感信息',
    params: {
        type: 'object',
        properties: {
            id: {
                title: '用户uid',
                type: 'string'
            }
        }
    },
    response: { type: 'object' }
} as GledePostSchema;
