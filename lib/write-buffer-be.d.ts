import { WriteBuffer } from "./write-buffer";
export declare class WriteBufferBE extends WriteBuffer {
    _u16(val?: number): void;
    _i16(val?: number): void;
    _u32(val?: number): void;
    _i32(val?: number): void;
    _u64(val?: bigint): void;
    _i64(val?: bigint): void;
    _f(val?: number): void;
    _d(val?: number): void;
    constructor();
}
//# sourceMappingURL=write-buffer-be.d.ts.map