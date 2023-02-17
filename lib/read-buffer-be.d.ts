/// <reference types="node" />
import { ReadBuffer } from "./read-buffer";
export declare class ReadBufferBE extends ReadBuffer {
    constructor(buffer: Buffer, offset?: number);
    _u16(): number;
    _i16(): number;
    _u32(): number;
    _i32(): number;
    _u64(): bigint;
    _i64(): bigint;
    _f(): number;
    _d(): number;
}
//# sourceMappingURL=read-buffer-be.d.ts.map