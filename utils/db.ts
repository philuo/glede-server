/**
 * @file 数据库链接
 * @date 2022-06-28
 * @author Perfumere
 */

import mongoose from 'mongoose';
import Redis from 'ioredis';
import type { RedisOptions, Redis as RedisInstance } from 'ioredis';
import type { ConnectOptions } from 'mongoose';

let redisClient: RedisInstance;
let mongoClient;

/**
 * 获取Redis实例
 * @param opts RedisOptions
 */
export function __initRedis(opts: RedisOptions) {
    if (!redisClient) {
        redisClient = new Redis(opts);
    }
}

/**
 * 获取Mongoose实例
 * @param url mongoose.connect uri
 * @param opts mongoose.connect options
 */
export function __initMongo(url: string, opts: ConnectOptions) {
    if (!mongoClient) {
        mongoClient = mongoose.connect(url, {
            ...opts,
            autoIndex: false
        });
    }
}


export function getRedisInstance() {
    return redisClient;
}

export function getMongoInstance() {
    return mongoClient as typeof mongoose;
}

const Schema = mongoose.Schema;

/**
 * @param name Model名称
 * @param schema Model格式校验
 * @param opts.collection 可选, 指定MongoDB集合名称
 * @param opts.statics 必选, 指定Model上的静态方法
 */
export function Model<T, K>(
    name: string,
    schema: T,
    opts?: GledeModelOpts<K>
) {
    const options = {
        versionKey: false,
        statics: opts ? opts.statics : undefined
    };

    return mongoose.model(
        name, 
        new Schema(schema, options),
        opts.collection
    );
}
