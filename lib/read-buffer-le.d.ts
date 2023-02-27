/// <reference types="node" />
import { ReadBuffer } from "./read-buffer";
export declare class ReadBufferLE extends ReadBuffer {
    _u16(): number;
    _i16(): number;
    _u32(): number;
    _i32(): number;
    _u64(): bigint;
    _i64(): bigint;
    _f(): number;
    _d(): number;
    constructor(buffer: Buffer, offset?: number);
}
//# sourceMappingURL=read-buffer-le.d.ts.map