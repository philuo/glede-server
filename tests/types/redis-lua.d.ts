import type { Redis } from 'ioredis';

type numeric = number | string;

export interface LuaRedis extends Redis {
    /**
     * 获取指定类型的统计量, 如果id对应的统计量则返回null
     * @param key 类型 _dynstat | _cmntstat
     * @param ids 拼接 `$key?$id` 作为 redis 的key
     */
    statList: (key: numeric, ...ids: numeric[]) => Promise<string[][]>;
}
