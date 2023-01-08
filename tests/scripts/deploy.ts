/**
 * @file webhook integration
 * @author Perfumere
 * @date 2022-12-31
 */

// 您完全可以自定义部署, 本脚本仅供参考

import { createServer } from 'http';
import { exec } from 'child_process';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const port = 5550;
const server = createServer((req, res) => {
    res.end();

    let content = '';

    if (req.method === 'POST' && req.url.startsWith('/deploy')) {
        req.on('data', chunk => {
            content += chunk;
        });
        req.on('end', () => {
            const { ref, before, after, head_commit } = JSON.parse(content);

            if (!head_commit || !before || !after) {
                return;
            }

            const { modified = [], message = '' } = head_commit;

            let npmInstall = false;

            for (const filename of modified) {
                if (filename === 'package.json') {
                    npmInstall = true;
                    break;
                }
            }

            if (ref === 'refs/heads/main' && before !== after) {
                deployTask(npmInstall, message);
            }
        });
    }
});

server.listen(port, () => {
    console.log(`webhook listen on port ${port}`);
});

/**
 * 部署任务
 */
function deployTask(npmInstall, message = '') {
    const scriptPath = resolve('scripts', 'deploy.sh');
    const logPath = resolve('logs', 'deploy.log');
    const date = new Date().toLocaleString();

    npmInstall = npmInstall ? '0' : '';

    exec(`sh ${scriptPath} ${npmInstall}`, (err, stdout, stderr) => {
        if (err) {
            writeFileSync(logPath, `[ERROR] ${date} ${err.message} \n`, { flag: 'a' });

            return;
        }
        if (stderr) {
            const msg = stderr.replace(/\n|\r/g, '');
            writeFileSync(logPath, `[WARNING] ${date} [MESSAGE] ${msg} \n`, { flag: 'a' });
        }
        if (stdout && stdout.includes('==finish to deploy==')) {
            writeFileSync(logPath, `[SUCCESS] ${date} [COMMIT] ${message} \n`, { flag: 'a' });
        }
    });
}
