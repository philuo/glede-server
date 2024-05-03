/**
 * @file 服务入口初始化
 * @author fanchong
 * @date 2024-05-03
 */
import cats from '#/controllers/cat';
// modelAs后缀不一定是s, 请查看mongoose文档的集合命名方式, 当然你也可以强制自定义集合名, 这样你就可以使用单数形式的集合名
// import modelAs from '#/controllers/modelA';

/**
 * 传入Promise为之绑定catch方法并返回，设置打印错误日志
 * @param p Promise
 * @param errHead 补全日志头部描述
 * @param level 错误级别 0 error | 1 warn | 2 info
 * @returns 绑定了catch回调的Promise本身
 */
export function CatchExec<T = any>(p: any, errHead = '', level: 0 | 1 | 2 = 0): Promise<T> {
    return p.catch(e => {
      const errMsg = `${errHead} ${e}`;
  
      if (level === 0) {
        console.error(errMsg);
      }
      if (level === 1) {
        console.warn(errMsg);
      }
      if (level === 2) {
        console.info(errMsg);
      }
    });
}
  

/**
 * 服务初始化
 */
export function serviceEntry() {
  /**
   * 日志打印工具
   */
  global.logger = {
    // 建议把日志打印工具挂载到全局对象上方便使用... 
  };
  /**
   * 传入Promise为之绑定catch方法并返回，设置打印错误日志
   */
  global.CatchExec = CatchExec;
  /**
   * mongodb模型
   */
  // global.models = mongoose.models;
  global.models = {
   cats,
   // ...你的其他Mongoose模型
  };
}
