/**
 * @file 基于rotating-file-stream同步记录日志
 * @author Perfumere
 * @date 2023-12-10
 */

import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { createStream, type RotatingFileStream } from '../jssdk/rotating-file-stream';

interface LoggerOpts {
    /**
     * 日志存储目录
     */
    dir?: string;
    /**
     * 输出目标 0 终端 ｜ 1 文件
     */
    target?: Array<0 | 1>;
    /**
     * 日志文件名, 会被轮转和最大提及限制拆分
     */
    filename?: string;
    /**
     * 轮转时间 分m 时h 天d 月M
     */
    interval?: string;
    /**
     * 单个日志文件最大的大小 10M
     * 1024B 表示 1KB; 1M 表示 1MB; 1G 表示 1GB
     */
    size?: string;
    /**
     * 是否开启压缩
     */
    compress?: true | 'gzip';
    /**
     * 最多保留日志文件数量, 删除旧的
     */
    maxFiles?: number;
}

// 补零
function __padZero(num: number) {
    return (num < 10 ? '0' : '') + num;
}

// 获取生成的时间
function __getTime() {
    const date = new Date();

    const year = date.getFullYear();
    const month = __padZero(date.getMonth() + 1);
    const day = __padZero(date.getDate());

    const hours = __padZero(date.getHours());
    const minutes = __padZero(date.getMinutes());
    const seconds = __padZero(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export class Logger {
    public writeTerminal: boolean;
    public writeFile: boolean;
    public logStream: RotatingFileStream;

    constructor(opts: LoggerOpts) {
        const dir = opts.dir || path.join(__dirname, 'logs');
        const filename = opts.filename || 'glede-server.log';

        this.writeTerminal = (opts.target || [1]).includes(0);
        this.writeFile = (opts.target || [1]).includes(1);

        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        delete opts.dir;
        delete opts.filename;
        delete opts.target;

        this.logStream = createStream(filename, {
            interval: '30d',
            size: '10M',
            path: dir,
            ...opts
        });
    }

    info(message) {
        const output = `[${__getTime()}] [INFO] ${message}\n`;
        this.writeTerminal && this.log(output, 2);
        this.writeFile && this.logStream.write(output);
    }

    warn(message) {
        const output = `[${__getTime()}] [WARN] ${message}\n`;
        this.writeTerminal && this.log(output, 1);
        this.writeFile && this.logStream.write(output);
    }

    error(message) {
        const output = `[${__getTime()}] [ERROR] ${message}\n`;
        this.writeTerminal && this.log(output, 0);
        this.writeFile && this.logStream.write(output);
    }

    log(message, level = 2) {
        if (level === 0) {
            console.log('\x1b[31m%s\x1b[0m', message);
        }
        else if (level === 1) {
            console.log('\x1b[33m%s\x1b[0m', message);
        }
        else {
            console.log('\x1b[32m%s\x1b[0m', message);
        }
    }
}
