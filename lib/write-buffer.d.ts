/// <reference types="node" />
import { WriterFunctions, WriterValue } from "./types";
import { BaseBuffer } from "./base-buffer";
export declare class WriteBuffer extends BaseBuffer {
    protected _types: string[];
    protected _buffers: Buffer[];
    protected _offset: number;
    protected _atomFunctions: Map<string, WriterFunctions>;
    private _u8;
    private _i8;
    private _s;
    constructor();
    write(type: string, val: WriterValue): void;
    get buffer(): Buffer;
    toBuffer(): Buffer;
    get size(): number;
    get offset(): number;
    protected addAtom(atom: string, buffer: Buffer): void;
    toAtoms(): string[];
    get size2(): number;
}
//# sourceMappingURL=write-buffer.d.ts.map