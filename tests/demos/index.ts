/**
 * @file 用例入口文件
 * @date 2022-07-02
 * @author Perfumere
 */

import { Server } from 'glede-server';

Server({ conf: 'configs/app-dev.ts' }, async (err, adr) => {
    if (err) {
        return;
    }

    // import your wonderful test usage files
    // import('./schedule.ts' as any);
    // import('./mailer.ts' as any);
    // import('./token.ts' as any);
    // import('./account.ts' as any);
    import('./model.ts' as any);

    console.log(`Test Server is running at ${adr}`);
});
