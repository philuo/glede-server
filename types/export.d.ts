/**
 * @file GledeServer 导出类型文件
 * @date 2022-06-27
 * @author Perfumere
 */

import type { FastifyInstance } from 'fastify';
import type { Model as _Model, ConnectOptions } from 'mongoose';
import type { Mongoose } from 'mongoose'
import type { Redis } from 'ioredis';

interface GledeThis {
    /**
     * 获取请求源的IPv4
     */
    getIp: () => string;

    /**
     * 获取请求源的行政区
     */
    getRegion: (ip?: string) => GledeIpRegion;

    /**
     * 获取认证信息
     */
    getToken: () => GledeTokenPayload;

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
    body: Record<string, any>,
    params: Record<string, any>;
    query: Record<string, any>;
}

type GledeAuthLevel = 'noauth' | 'user' | 'admin' | 'super' | 'root';

interface GledeTokenOpts {
    /** 分发加盐 */
    salt: string;
    /** 令牌有效期 */
    period: number;
}

interface GledeMailerOpts {
    /**
     * smtp地址
     * for example: smtp.feishu.cn
     */
    host: string;

    /**
     * 登录邮箱URL
     * for example: __test@philuo.com
     */
    user: string;

    /**
     * 登录邮箱密码
     * tip: 写入环境变量中, 设置高权限只读
     */
    pass: string;

    /**
     * 邮箱单日最大发送数量（注意群发算一次）, 临界时切换下一个配置邮箱
     * tip: 设置为邮箱额度的3/4
     */
    nums: number;
}

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

    /** token config */
    token?: GledeTokenOpts;

    /** mailer config */
    mailer?: GledeMailerOpts[];
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

export interface GledeTokenPayload {
    /** 用户id */
    uid?: string;
    /** 生效时间, 秒级时间戳 */
    nbf?: number;
    /** 过期时间, 秒级时间戳 */
    exp?: number;
    /** 票据权限 */
    role?: string;
}

/**
 * 创建GledeServer实例
 */
export function Server(
    opts: GledeServerOpts,
    cb?: (err?: Error, address?: string) => void
): FastifyInstance;

/**
 * GET方法装饰器
 * @param subpath 路径名, 不要带/
 * @param options GledeGetMethodOpts:`{version, schema}`
 * 
 * `version = v1 -> /v1/path/subpath`
 *
 * `version = v1 -> /api/v1/path/subpath`
 * 
 * `version = '' -> /path/subpath`
 * 
 * `version = '' -> /openapi/path/subpath`
 * 
 */
export function Get(
    subpath: string,
    options?: GledeGetMethodOpts
): (target: any, name: any) => void;

/**
 * POST方法装饰器
 * @param subpath 路径名, 不要带/
 * @param options GledeGetMethodOpts:`{version, schema}`
 * 
 * `version = v1 -> /v1/path/subpath`
 *
 * `version = v1 -> /api/v1/path/subpath`
 * 
 * `version = '' -> /path/subpath`
 * 
 * `version = '' -> /openapi/path/subpath`
 */
export function Post(
    subpath: string,
    options?: GledePostMethodOpts
): (target: any, name: any) => void;

/**
 * [设置跨域资源共享](https://www.php.cn/manual/view/35589.html)
 * @param origin Access-Control-Allow-Origin; Default: *
 * @param method Access-Control-Allow-Methods; Default: `GET,POST`
 * @param credential Access-Control-Allow-Credentials; `设置此项时要求origin 不能为 *`
 */
export function Cors(
    origin?: string | string[],
    method?: string,
    credential?: boolean
): (target: any, name: any) => void;

/**
 * 设置身份鉴权, Default: noauth
 * @param level noauth | user | admin | super | root
 */
export function NeedAuth(level: GledeAuthLevel): (target: any, name: any) => void;

/** 路由基类 */
export abstract class GledeRouter {
    readonly [prop: string]: (this: GledeThis, data: GledeReqData) => GledeResData | Promise<GledeResData>
        | void | Promise<void>;
}

/** 获取GledeServer实例 */
export function getServerInstance(): FastifyInstance;

/**
 * 打印路由树, 服务器运行时方法。 Default: logs/routers.txt
 */
export function printRouters(opts: GledeServerOpts): void;

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
): _Model<T, K>;

interface GledeTokenUtil {
    /** 签发令牌 */
    sign(payload?: GledeTokenPayload): string;

    /**
     * 验证令牌
     * @param token string
     * @returns 验证状态
     * `0、1验证通过, 1表示token即将过期`
     * `2~5验证失败, 2解析错误, 3未生效, 4已失效, 5已篡改`
     */
    verify(token: string): 0 | 1 | 2 | 3 | 4 | 5;
}

interface GledeMailMessage {
    /** 接收方邮件URL */
    to: string;
    /** 发送方邮件URL */
    from?: string;
    /** 邮件标题 */
    subject?: string;
    /** 邮件HTML内容, 与text字段互斥 */
    html?: string;
    /** 邮件文本内容, 与html字段互斥 */
    text?: string;
}

interface GledeMailer {
    sendMail: (message: GledeMailMessage) => any;
}

/**
 * 业务路由工具集
 * `获取TokenUtil, 发送邮件`
 */
export namespace GledeUtil {

    /** 获取TokenUtil */
    export function getTokenUtil(): GledeTokenUtil;

    /**
     * 使用Mailer发送业务邮件
     * for example: 验证码, 安全认证, 订阅提醒
     */
    export function sendMail(message: GledeMailMessage): any;
}

/**
 * 业务静态工具
 * `创建TokenUtil, Mailer, 获取数据库实例等`
 */
export namespace GledeStaticUtil {
    /**
     * 通过配置获取对应的Token工具
     * @param opts.salt 秘钥字符串
     * @param opts.period 有效时长
     */
    export function createTokenUtil(opts: GledeTokenOpts): GledeTokenUtil;

    /**
     * 通过配置获得Mailer, 使用限制由开发者自己实现
     */
    export function createMailer(opts: GledeMailerOpts): GledeMailer;

    /** 获取Redis实例 */
    export function getRedisInstance(): Redis;

    /** 获取Mongoose实例 */
    export function getMongoInstance(): Mongoose;

    /**
     * [验证cronStr是否符合规则](https://github.com/philuo/node-cron)
     * @param cronStr `* * * * * * | * * * * *`
     */
    export function validate(cronStr: string): boolean;

    /**
     * 生成事务并返回控制手柄
     * @param cronStr cron规则描述
     * @param func 回调方法
     */
    export function schedule(cronStr: string, func: Function): GledeScheduleTask;

    /**
     * 生成事务并返回控制手柄
     * @param cronStr cron规则描述
     * @param filePath 文件路径
     */
    export function schedule(cronStr: string, filePath: string): GledeBGScheduleTask;
}

/** 同一进程处理事务 */
interface GledeScheduleTask {
    /** 启动事务 */
    start(): void;
    /** 注销事务 */
    stop(): void;
    /**
     * 同步立即触发
     * @param now 自定义标识, 可在事务回调中识别手动或自动
     * @default 'manual'
     */
    now(now?: string): void;
}

/** 启动子进程处理事务, 非独立子进程（随主线程退出而终结） */
interface GledeBGScheduleTask {
    /** 启动事务 */
    start(): void;
    /** 注销事务 */
    stop(): void;
    /**
     * 获取工作进程的pid
     * @param now 自定义标识, 可在事务回调中识别手动或自动
     */
    pid(): number | undefined;
    /** 事务是否在正常处理中 */
    isRunning(): boolean;
}
