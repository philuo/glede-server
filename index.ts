/**
 * @file GledeServer Entry
 * @date 2022-06-25
 * @author Perfumere
 */
import {
    getRedisInstance,
    getMongoInstance,
    __getTokenUtil as getTokenUtil,
    createTokenUtil,
    createMailer,
    sendMail,
    schedule,
    validate
} from './utils';

export const GledeStaticUtil = {
    getRedisInstance,
    getMongoInstance,
    createTokenUtil,
    createMailer,
    schedule,
    validate
};

/**
 * 运行时方法
 */
export const GledeUtil = {
    getTokenUtil,
    sendMail
};

export { Server } from './libs/init';
export { printRouters } from './libs/route';
export { GledeRouter, getServerInstance } from './libs/base';
export { Get, Post, Cors, NeedAuth } from './libs/decorator';
export { Schema, ObjectId, Model, Transaction } from './utils';
