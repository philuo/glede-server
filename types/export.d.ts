/**
 * @file GledeServer 导出类型文件
 * @date 2022-06-27
 * @author Perfumere
 */

import type { FastifyInstance } from 'fastify';
import type { Model as _Model, ConnectOptions } from 'mongoose';

interface GledeUtil {
    /**
     * 获取请求源的IPv4
     */
    getIp: () => string;

    /**
     * 获取请求源的行政区
     */
    getRegion: () => GledeIpRegion;

    /**
     * 获取认证信息
     */
    getToken: () => string;

    /**
     * 获得请求头中的指定字段
     */
    getHeader: (key: GledeReqHeader) => string;

    /**
     * 获得完整的请求头数据对象
     */
    getHeaders: () => Readonly<Record<GledeReqHeader, string> & Record<string, string>>;

    /**
     * 指定字段, 设置响应头
     */
    setHeader: (key: string, value: string) => void;

    /**
     * 指定字段, 移除响应头
     */
    removeHeader: (key: string) => void;

    /**
     * 指定字段, 查看是否存在于响应头中
     */
    hasHeader: (key: string) => void;
}

interface GledeReqData {
    body: Record<string, string>,
    params: Record<string, string>;
    query: Record<string, string>;
}

type GledeAuthLevel = 'noauth' | 'user' | 'admin' | 'super' | 'root';

interface GledeServerOpts {

    /**
     * 配置文件路径
     * Default: ./configs/app.json
     */
    conf?: string;

    /**
     * 服务监听端口
     * Default: to 0 (picks the first available open port).
     */
    port?: number;

    /**
     * 服务启动地址
     * Default: localhost
     */
    host?: string;

    /**
     * Fastify日志配置
     * Default: { level: 'error', file: './logs/error.log' }
     */
    logger?: {

        /**
         * 记录最低级别 fatal > error > warn > info
         */
        level: "fatal" | "error" | "warn" | "info";

        /**
         * 日志存储文件地址
         */
        file?: string;
    } | false;

    /**
     * 路由目录地址
     * Default: routers
     */
    routerDir?: string;

    /**
     * 详情记录地址: 路由树状图 | 接口信息
     * Default: logs
     */
    infoDir?: string;

    /**
     * 生成日志配置
     */
    apiDocs?: any;

    /** redis config */
    redis?: {
        host?: string;
        port?: number;
        password?: string;
    };

    /** mongodb config */
    mongodb?: {
        url: string;
        options?: ConnectOptions;
    };
}

type JsonSchemaCombineType = 'array' | 'object';
type JsonSchemaNumericType = 'string' | 'number' | 'integer';
type JsonSchemaNormalType = 'boolean' | 'null';
type JsonSchemaType = JsonSchemaCombineType | JsonSchemaNumericType | JsonSchemaNormalType;

interface JsonSchemaString {
    type: 'string';

    /** 最小长度整数 */
    minLength?: number;
    /** 最大长度整数 */
    maxLength?: number;
    /**
     * [正则规则子集链接](https://json-schema.apifox.cn/#%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F)
     * 
     * 注意`\\`表示一个`\`,例如`\\(`表示`\(`
     */
    pattern?: string;
    /** 校验：枚举 */
    enum?: string[];
    /** 指定唯一值 */
    const?: string;
}

interface JosnSchemaNumric {
    type: 'number' | 'integer';
    /** 校验：指定整数的倍数关系 */
    multipleOf?: number;
    /** `x >= 整数` */
    minimum?: number;
    /** `x <= 整数` */
    maximum?: number;
    /** 校验：枚举 */
    enum?: number[];
    /** 指定唯一值 */
    const?: number;
}

interface JosnSchemaObject {
    type: 'object';
    /** 属性 */
    properties?: Record<string, JsonSchema>;
    /** 校验：同级properties必选属性 */
    required?: string[];
}

interface JosnSchemaArray {
    type: 'array';
    /** 属性 */
    items?: JsonSchema | JsonSchema[];
    /** 校验：数组最小长度 */
    minItems?: number;
    /** 校验：数组最大长度 */
    maxItems?: number;
}

interface JsonSchemaNormal {
    type: JsonSchemaNormalType;
}

interface JsonSchemaEnum {
    enum: any[];
}

interface JsonSchemaDescription {
    /** 字段名 */
    title?: string;
    /** 字段解释 */
    description?: string;
    /** 默认值 */
    default?: string;
    /** 举例说明 */
    examples?: any[];
}

type JsonSchema = ((JsonSchemaString | JosnSchemaNumric
    | JosnSchemaObject | JosnSchemaArray | JsonSchemaNormal) & JsonSchemaDescription)
    | JsonSchemaAnyOf | JsonSchemaOneOf | JsonSchemaAllOf
    | JsonSchemaEnum | JsonSchemaNot;

interface GledeSchemaBase {
    /** 接口名称 */
    summary: string;
    /** 接口说明 */
    description: string;
    /** 接口辨识标签 */
    tags?: string[];
    /** 接口可视安全性设置 */
    security?: any[];
}
interface GledeGetSchema extends GledeSchemaBase {
    response: JsonSchema;
    query?: JsonSchema;
    params?: JsonSchema;
}

interface GledePostSchema extends GledeSchemaBase {
    response: JsonSchema;
    body?: JsonSchema;
    params?: JsonSchema;
}

type GledeSchema = GledeGetSchema | GledePostSchema;

type GledeGetMethodOpts = {
    version?: string;
    schema?: GledeGetSchema;
};

type GledePostMethodOpts = {
    version?: string;
    schema?: GledePostSchema;
};

type GledeMethodOpts = {
    version?: string;
    schema?: GledeSchema;
};

interface JsonSchemaAnyOf {
    anyOf: JsonSchema[];
}

interface JsonSchemaOneOf {
    oneOf: JsonSchema[];
}

interface JsonSchemaAllOf {
    allOf: JsonSchema[];
}

interface JsonSchemaNot {
    not: JsonSchema[];
}

interface GledeModelOpts<T> {
    /**
     * 指定集合名, 默认集合名为
     * Default: Model('name') -> names
     */
    collection?: string;

    /**
     * 添加Model静态方法
     */
    statics: T;
}


export function Server(
    opts: GledeServerOpts,
    cb?: (err?: Error, address?: string) => void
): FastifyInstance;

export function Get(
    subpath: string,
    options?: GledeGetMethodOpts
): (target: any, name: any) => void;

export function Post(
    subpath: string,
    options?: GledePostMethodOpts
): (target: any, name: any) => void;

export function Cors(
    origin?: string | string[],
    method?: string,
    credential?: boolean
): (target: any, name: any) => void;

export function NeedAuth(level: GledeAuthLevel): (target: any, name: any) => void;

export abstract class GledeRouter {
    readonly [prop: string]: (this: GledeUtil, data: GledeReqData) => GledeResData;
}

export function getServerInstance(): FastifyInstance;

export function printRouters(opts: GledeServerOpts): void;

export function Model<T, K>(
    name: string,
    schema: T,
    opts?: GledeModelOpts<K>
): _Model<T, K>;
