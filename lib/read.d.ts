import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
export declare class Read<T> {
    _struct: T;
    _reader: ReadBufferLE | ReadBufferBE;
    _recursion(struct: T): void;
    /**
     * Reading dynamic array. Array length is written before array items.
     * <arrayLength><arrayItem1><arrayItem2>...
     */
    private _readDynamicArray;
    /**
     * Reading dynamic string. String length is written before string.
     * <stringLength><string>
     */
    private _readDynamicString;
    _read(struct: T, key: string, type: string): void;
    toStruct(): T;
    get size(): number;
    get offset(): number;
}
//# sourceMappingURL=read.d.ts.map