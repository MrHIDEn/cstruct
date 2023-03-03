import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { Type } from "./types";
import { ReadWriteBase } from "./read-write-base";
export declare class Read<T> extends ReadWriteBase {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;
    _recursion(struct: T): void;
    private _readDynamicItem;
    _read(struct: T, key: string, type: Type): void;
    toStruct(): T;
    get size(): number;
    get offset(): number;
    toAtoms(): string[];
}
//# sourceMappingURL=read.d.ts.map