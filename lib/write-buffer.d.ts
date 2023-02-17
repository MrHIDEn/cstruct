/// <reference types="node" />
export declare class WriteBuffer {
    _buffers: Buffer[];
    _offset: number;
    _writers: Map<string, Function>;
    _u8(val?: number): void;
    _i8(val?: number): void;
    _s(val: string, type: string): void;
    _str(val?: string): void;
    get buffer(): Buffer;
    toBuffer(): Buffer;
    get size(): number;
    get size2(): number;
    write(type: string, val: any): void;
}
//# sourceMappingURL=write-buffer.d.ts.map