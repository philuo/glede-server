/**
 * @file GledeServer Entry
 * @date 2022-06-25
 * @author Perfumere
 */
import {
    getRedisInstance,
    getMongoInstance,
    getPgInstance,
    __getTokenUtil as getTokenUtil,
    __getSignUtil as getSignUtil,
    createTokenUtil,
    createSignUtil,
    createMailer,
    sendMail,
    schedule,
    validate,
    getTasks,
    Logger
} from './utils';

import mongoose from 'mongoose';
import Redis from 'ioredis';
import pg from 'pg';

export const GledeStaticUtil = {
    getRedisInstance,
    getMongoInstance,
    getPgInstance,
    createTokenUtil,
    createSignUtil,
    createMailer,
    schedule,
    validate,
    getTasks,
    Logger
};

/**
 * 运行时方法
 */
export const GledeUtil = {
    getTokenUtil,
    getSignUtil,
    sendMail
};

export { Server } from './libs/init';
export { printRouters } from './libs/route';
export { GledeRouter, getServerInstance } from './libs/base';
export { Get, Post, Cors, NeedAuth, NeedSign, Multer } from './libs/decorator';
export { Schema, ObjectId, Model, Transaction } from './utils';
// export * as mongoose from 'mongoose';
// export * as Redis from 'ioredis';
// export * as pg from 'pg';

export { mongoose, Redis, pg };
