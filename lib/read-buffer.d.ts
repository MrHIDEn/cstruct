/// <reference types="node" />
import { ReaderFunctions, ReaderValue } from "./types";
export declare class ReadBuffer {
    protected _types: string[];
    protected _buffers: Buffer[];
    protected _buffer: Buffer;
    protected _offset: number;
    protected _beginOffset: number;
    protected _readers: Map<string, ReaderFunctions>;
    constructor(buffer: Buffer, offset?: number);
    private _u8;
    private _i8;
    private _s;
    addAlias(alias: string, type: string): void;
    read(type: string): ReaderValue;
    get size(): number;
    get offset(): number;
    protected addAtom(type: string, size: number): void;
    toAtoms(): string[];
}
//# sourceMappingURL=read-buffer.d.ts.map