/**
 * @file 发送邮件用例
 * @date 2022-07-02
 * @author Perfumere
 */

/** 运行时工具 */
import { GledeUtil, GledeStaticUtil } from 'glede-server';

// 邮件曝光埋点
const markup = encodeURIComponent(JSON.stringify({ module: '@mailer', id: 'mailId' }));
const monitor = `<img src="https://log.plog.top/rc?typ=pv&act=1_1&d=${markup}" style="display:none">`;

// 单发
const toSinglePeople = {
    to: '__test@philuo.com',
    html: '<img src="https://plog.top/favicon.ico">'
};

// 多发 使用英文逗号分隔
const toMultiPeople = {
    // 请使用您自己邮箱接收测试, 谢谢！
    to: '__test@philuo.com,1061393710@qq.com',
    html: '<img src="https://plog.top/favicon.ico">' + monitor
};

// server ready后才可执行, 此处延时是等待服务启动, 请保证仅在路由中使用此方法！
// setTimeout(() => {
//     // GledeUtil.sendMail(toSinglePeople);
//     // GledeUtil.sendMail(toMultiPeople);
// }, 1500);


/**
 * 自建Mailer, 此工具需申请
 */
// export const myMailer = GledeStaticUtil.createMailer({
//     host: 'smtp.feishu.cn',
//     user: '<email>',
//     pass: '<auth>',
//     nums: 200 // 单日最大发送额度
// });

// // 发送时需要注明来源(from), 否则可能发送失败或者被当做垃圾邮件拒收
// myMailer.sendMail({from: '<email>', ...toSinglePeople });
// myMailer.sendMail({from: '<email>', ...toMultiPeople });
