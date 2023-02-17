/// <reference types="node" />
export type Model = object | any[] | string;
export type Types = object | any[] | string;
export interface CStructReadResult<T> {
    struct: T;
    offset: number;
    size: number;
}
export interface CStructWriteResult {
    buffer: Buffer;
    offset: number;
    size: number;
}
//# sourceMappingURL=types.d.ts.map