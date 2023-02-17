/// <reference types="node" />
import { Make } from "./make";
export declare class Write<T> extends Make<T> {
    _buffer: Buffer;
    _offset: number;
    constructor(buffer: Buffer, offset?: number);
    toBuffer(): Buffer;
    get offset(): number;
}
//# sourceMappingURL=write.d.ts.map