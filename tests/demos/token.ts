/**
 * @file Token工具用例
 * @date 2022-07-02
 * @author Perfumere
 */

/** 运行时工具, 仅在路由中使用 */
import { GledeUtil, GledeStaticUtil } from 'glede-server';

const TokenUtil = GledeUtil.getTokenUtil();

// 签发令牌, 默认角色是用户(user), 过期时长(配置文件token.period), 加盐(配置文件token.salt)
const token = TokenUtil.sign({ uid: 1001 });

// 解析令牌
const tokenRes = TokenUtil.verify(token, 3);
console.log(token, tokenRes);

/**
 * 业务自建TokenUtil, 此工具需申请
 */
const myTokenUtil = GledeStaticUtil.createTokenUtil({
    salt: 'balabala', // 你的秘钥, 一定要安全地保存好!
    period: 3600      // 单位秒
});

const mytoken = myTokenUtil.sign();
myTokenUtil.verify(mytoken, 3);
