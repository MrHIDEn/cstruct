import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { Type } from "./types";
export declare class Read<T> {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;
    private _dynamicLengthRegex;
    _recursion(struct: T): void;
    private _readDynamicItem;
    _read(struct: T, key: string, type: Type): void;
    toStruct(): T;
    get size(): number;
    get offset(): number;
    toAtoms(): string[];
}
//# sourceMappingURL=read.d.ts.map