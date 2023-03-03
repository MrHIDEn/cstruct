/// <reference types="node" />
import { Model, Type } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
import { ReadWriteBase } from "./read-write-base";
export declare class Make<T> extends ReadWriteBase {
    protected _writer: WriteBufferLE | WriteBufferBE;
    _recursion(model: Model, struct: T): void;
    private _writeDynamicItem;
    _write(model: Model, struct: T, key: string, type: Type): void;
    toBuffer(): Buffer;
    get offset(): number;
    get size(): number;
    getBufferAndOffset(): (number | Buffer)[];
    toAtoms(): string[];
}
//# sourceMappingURL=make.d.ts.map