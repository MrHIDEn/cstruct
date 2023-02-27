import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
export declare class Read<T> {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;
    private _dynamicLengthRegex;
    _recursion(struct: T): void;
    private _readDynamicItem;
    _read(struct: T, key: string, type: string): void;
    toStruct(): T;
    get size(): number;
    get offset(): number;
    toAtoms(): string[];
}
//# sourceMappingURL=read.d.ts.map