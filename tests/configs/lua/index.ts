/**
 * @file 导出lua脚本
 * @author Perfumere
 * @date 2023-01-02
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const statList = {
    lua: readFileSync(join(__dirname, 'statList.lua'), 'utf-8'),
    numberOfKeys: 1
};

export default {
    statList
};
