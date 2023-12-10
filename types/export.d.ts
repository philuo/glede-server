/**
 * @file GledeServer 导出类型文件
 * @date 2022-06-27
 * @author Perfumere
 */

import type { FastifyInstance } from 'fastify';
import type { Model as _Model, ConnectOptions } from 'mongoose';
import type { Mongoose, ClientSession } from 'mongoose'
import type { Redis } from 'ioredis';

interface GledeThis {
    /** 请求方法 */
    method: 'GET' | 'POST';
    /**
     * 请求路径 “/?” 开头
     */
    url: string;
    /**
     * 获取请求源的IPv4
     */
    getIp: () => string;

    /**
     * 获取请求源的行政区
     */
    getRegion: (ip?: string) => GledeIpRegion;

    /**
     * 获取认证信息, 建议在未使用 `@NeedAuth` 时判定下返回结果中payload是否非空
     * 可能获取 { token: '', payload: null } { token: ..., payload: null }
     */
    getToken: () => TokenParam;

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

interface TokenParam {
    token: string;
    payload: GledeTokenPayload;
}

interface GledeReqData {
    query: Record<string, any> & TokenParam;
    body: Record<string, any> & TokenParam;
    params: Record<string, any>;
}

type GledeAuthLevel = 'noauth' | 'user' | 'admin' | 'super' | 'root';

interface GledeTokenOpts {
    /** 分发加盐 */
    salt: string;
    /** 令牌有效期 */
    period: number;
}

interface GledeSignOpts {
    /** 分发加盐 */
    salt: string;
    /** baseKey, 用于生成加签key */
    key: string;
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

    /** sign config */
    sign?: GledeSignOpts;

    /** mailer config */
    mailer?: GledeMailerOpts[];
}

type JsonSchemaNormalType = 'boolean' | 'null';

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
    /** 默认值 */
    default?: string;
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
    /** 默认值 */
    default?: number;
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
    /** 默认值 */
    default?: boolean | null;
}

interface JsonSchemaEnum {
    enum: any[];
}

interface JsonSchemaDescription {
    /** 字段名 */
    title?: string;
    /** 字段解释 */
    description?: string;
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
    uid?: string | number;
    /** 生效时间, 秒级时间戳 */
    nbf?: number;
    /** 过期时间, 秒级时间戳 */
    exp?: number;
    /**
     * 票据权限
     * Default: 3 -> user, from 0 start
     * ['root', 'super', 'admin', 'user', ...]
     */
    role?: number;
}

/**
 * 创建GledeServer实例
 * @param 初始化参数 {@link GledeServerOpts}
 * @param 启动回调
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

/**
 * 设置页签校验, 防止中间人截获请求体并篡改
 */
export function NeedSign(): (target: any, name: any) => void;

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
 * 创建MongoDB Model
 * @param name Model名称
 * @param schema Model格式校验
 * @param opts.collection 可选, 指定MongoDB集合名称
 * @param opts.statics 必选, 指定Model上的静态方法
 */
export function Model<T, K>(
    name: string,
    schema: T,
    opts?: GledeModelOpts<K>
): _Model<T, K> & K;

export { Schema } from 'mongoose';

/**
 * 生成ObjectId, 可通过toString()获取字符值
 * @param id 传入后尝试获取已有_id, 否则给到新的_id
 */
export function ObjectId(id?: string | number | Mongoose['Types']['ObjectId']): Mongoose['Types']['ObjectId'];

/**
 * 事务处理块, 保证多集合CRUD数据的一致性
 * @param func CRUD操作集合
 */
export function Transaction(func: (session: ClientSession) => void | Promise<void>): Promise<void>;

interface GledeTokenUtil {
    /** 签发令牌 */
    sign(payload?: GledeTokenPayload): string;

    /**
     * 验证令牌
     * @param token string
     * @returns 验证状态
     * `0、1验证通过, 1表示token即将过期`
     * `2~6验证失败, 2解析错误, 3未生效, 4已失效, 5已篡改, 6权限不足`
     */
    verify(token: string, role: number): 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

interface GledeSignUtil {
    /**
     * 签发签名
     */
    sign(): string;

    /**
     * 验证签名
     * @param sign string
     * @returns 验证状态
     * `0、1验证通过, 1表示sign即将过期`
     * `2~5验证失败, 2解析错误, 4已失效, 5已篡改`
     */
    verify(sign: string): 0 | 1 | 2 | 4 | 5;
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

    /** 获取SignUtil */
    export function getSignUtil(): GledeSignUtil;

    /**
     * 使用Mailer发送业务邮件
     * for example: 验证码, 安全认证, 订阅提醒
     */
    export function sendMail(message: GledeMailMessage): any;
}

export interface LoggerOpts {
    /**
     * 日志存储目录
     */
    dir?: string;
    /**
     * 输出目标 0 终端 ｜ 1 文件, 默认缺省 [1]
     * 默认[1]输出到日志文件; [0]输出到控制台, [0, 1]输出到控制台和文件
     */
    target?: Array<0 | 1>;
    /**
     * 日志文件名, 会被轮转和最大提及限制拆分
     * 默认 glede-server.log 如果开启轮转会自动补充后缀
     */
    filename?: string;
    /**
     * 轮转时间 分m 时h 天d 月M, 超时自动生成新文件
     * 格式如下 20231210-1411-03-glede-server.log
     */
    interval?: string;
    /**
     * 单个日志文件最大的大小 10M, 超大自动生成新文件
     * 格式如下 20231210-1411-03-glede-server.log
     * 1024B 表示 1KB; 1M 表示 1MB; 1G 表示 1GB
     */
    size?: string;
    /**
     * 控制单个文件大小, 注意开启压缩是再使用 超过限制后旧文件会被压缩
     * 同size属性
     */
    maxSize?: string;
    /**
     * 是否开启压缩
     */
    compress?: true | 'gzip';
    /**
     * 最多保留日志文件和压缩包数量, 从旧向新按时间倒序删除
     */
    maxFiles?: number;
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
     * 通过配置获取对应的Sign工具
     * @param opts.salt 秘钥字符串
     * @param opts.key 有效时长
     * @param opts.period 有效时长
     */
    export function createSignUtil(opts: GledeSignOpts): GledeSignUtil;

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

    /**
     * 生成事务并返回控制手柄
     * @param cronStr cron规则描述
     * @param filePath 文件路径
     */
    export function getTasks(): Map<string | number | symbol, GledeBGScheduleTask>;

    /**
     * 流式日志输出
     */
    export class Logger {
        constructor(opts: LoggerOpts);

        /**
         * 输出info级别日志 0 红色
         * [2023-12-10 03:14:32] [ERROR] $message
         */
        error(message: string): void;

        /**
         * 输出info级别日志 1 黄色
         * [2023-12-10 03:14:32] [WARN] $message
         */
        warn(message: string): void;

        /**
         * 输出info级别日志 2 绿色
         * [2023-12-10 03:14:32] [INFO] $message
         */
        info(message: string): void;

        /**
         * 输出到控制台, 不同level对应颜色不同; 默认info 绿色
         * [2023-12-10 03:14:32] [$level] $message
         */
        log(message: string, level?: 0 | 1 | 2): void;
    }
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
