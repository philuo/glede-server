/**
 * @file 事务用例
 * @date 2022-07-02
 * @author Perfumere
 */
import { GledeStaticUtil } from 'glede-server';


// every 20min 执行一次
const task = GledeStaticUtil.schedule('* */20 * * * * ', (type: string) => {
    // doSomething.

    // 通过 task.now() 手动
    if (type === 'manual') {
        // 决定事务不再进行
        task.stop();
    }
});

// 100ms后关闭了事务, 所以不会执行。
const sometime = 100;
setTimeout(() => task.now(), sometime)

/**
 * every 30s print memory usage.
 * 开发模式热更新可能导致执行多次, 开启子进程执行事务(第二个参数是文件路径)
 * node实例并未退出, 进程pid更换后才能使得上个事务退出.
 */
GledeStaticUtil.schedule('*/30 * * * * *', './crons/memory-monitor.ts');
