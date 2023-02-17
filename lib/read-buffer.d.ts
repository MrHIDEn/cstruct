/// <reference types="node" />
export declare class ReadBuffer {
    _buffer: Buffer;
    _offset: number;
    _beginOffset: number;
    _readers: Map<string, Function>;
    constructor(buffer: Buffer, offset?: number);
    _u8(): number;
    _i8(): number;
    _s(type: string): string;
    _str(size: number): string;
    read(type: string, size?: number): any;
    get size(): number;
    get offset(): number;
}
//# sourceMappingURL=read-buffer.d.ts.map