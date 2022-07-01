/**
 * @file GledeServer类型描述
 * @date 2022-06-27
 * @author Perfumere
 */

/** GledeRouterHandler 失败返回值类型 */
interface GledeResError {
    code: number;
    data: null,
    msg: string;
}

/** GledeRouterHandler 成功返回值类型 */
interface GledeResSuccess {
    code: number;
    data: Record<string, any>;
}

/** GledeRouterHandler 入参 */
declare interface GledeReqData {
    body: Record<string, any>,
    params: Record<string, any>;
    query: Record<string, any>;
}

declare type GledeSupportMethod = 'GET' | 'POST';
declare type GledeAuthLevel = 'noauth' | 'user' | 'admin' | 'super' | 'root';
type GledeRouterHandler = (this: GledeThis, data: GledeReqData) => GledeResData;

interface RouterParams {
    subpath: string;
    version: string;
    method: GledeSupportMethod | GledeSupportMethod[];
    handler: GledeRouterHandler;
    schema?: Record<string, string>;
}

declare type GledeRouterRecord = Record<symbol, RouterParams>;
declare type GledeResData = GledeResError | GledeResSuccess;

type ReqContentHeader = 'accept-language' | 'accept-encoding' | 'accept' | 'range';
type ReqOriginHeader = 'user-agent' | 'referer' | 'host' | 'x-real-ip';
type ReqPayloadHeader = 'authorization' | 'cookie';
type ReqCacheHeader = 'connection' | 'cache-control';
declare type GledeReqHeader = ReqContentHeader | ReqOriginHeader | ReqPayloadHeader | ReqCacheHeader;

declare interface GledeIpRegion {

    /**
     * 省份ID 1~34 | 0 未匹配
     */
    pid: number;

    /**
     * 城市ID
     */
    cid: number;

    /**
     * 省份名
     */
    province: string;

    /**
     * 城市名
     */
    city: string;

    /**
     * 区域编号
     */
    zone: string;

    /**
     * 供应商
     */
    ips: string;
}

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

declare interface GledeServerOpts {

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
        options?: any;
    };

    /** token config */
    token?: GledeTokenOpts;

    /** mailer config */
    mailer?: GledeMailerOpts[];
}

declare interface GledeThis {
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

declare type JsonSchema = ((JsonSchemaString | JosnSchemaNumric
    | JosnSchemaObject | JosnSchemaArray | JsonSchemaNormal) & JsonSchemaDescription)
    | JsonSchemaAnyOf | JsonSchemaOneOf | JsonSchemaAllOf
    | JsonSchemaEnum | JsonSchemaNot;


declare interface GledeSchemaBase {
    /** 接口名称 */
    summary: string;
    /** 接口说明 */
    description: string;
    /** 接口辨识标签 */
    tags?: string[];
    /** 接口可视安全性设置 */
    security?: any[];
}
declare interface GledeGetSchema extends GledeSchemaBase {
    response: JsonSchema;
    query?: JsonSchema;
    params?: JsonSchema;
}

declare interface GledePostSchema extends GledeSchemaBase {
    response: JsonSchema;
    body?: JsonSchema;
    params?: JsonSchema;
}

declare type GledeSchema = GledeGetSchema | GledePostSchema;

declare type GledeGetMethodOpts = {
    version?: string;
    schema?: GledeGetSchema;
};

declare type GledePostMethodOpts = {
    version?: string;
    schema?: GledePostSchema;
};

declare type GledeMethodOpts = {
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

declare type CollectionName = 'pv' | 'rdPerf' | 'rdErr' | 'rdBusi';

declare interface MongoConf {
    url: string;
    dbName: string;
    collectionName: Array<CollectionName>;
}

declare interface GledeModelOpts<T> {
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

declare interface GledeTokenPayload {
    /** 用户id */
    uid?: string;
    /** 生效时间, 秒级时间戳 */
    nbf?: number;
    /** 过期时间, 秒级时间戳 */
    exp?: number;
    /** 票据权限 */
    role?: string;
}

declare interface GledeTokenUtil {
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

declare interface GledeMailMessage {
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
