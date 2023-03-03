/// <reference types="node" />
import { ReaderFunctions, ReaderValue } from "./types";
import { BaseBuffer } from "./base-buffer";
export declare class ReadBuffer extends BaseBuffer {
    protected _types: string[];
    protected _buffers: Buffer[];
    protected _buffer: Buffer;
    protected _offset: number;
    protected _beginOffset: number;
    protected _atomFunctions: Map<string, ReaderFunctions>;
    private _u8;
    private _i8;
    private _s;
    private _buf;
    constructor(buffer: Buffer, offset?: number);
    read(type: string): ReaderValue;
    get size(): number;
    get offset(): number;
    protected addAtom(type: string, size: number): void;
    toAtoms(): string[];
}
//# sourceMappingURL=read-buffer.d.ts.map