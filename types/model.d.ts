/**
 * @file ModelType
 * @date 2022-06-30
 * @author Perfumere
 */

export interface ModelQuery<T> {

}

export function Model<T, K>(
    name: string,
    schema: T,
    opts?: GledeModelOpts<K>
): ModelQuery<T>;

interface GledeModelOpts<T> {
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
