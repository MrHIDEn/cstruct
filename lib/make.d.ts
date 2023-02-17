/// <reference types="node" />
import { Model } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
export declare class Make<T> {
    _writer: WriteBufferLE | WriteBufferBE;
    _recursion(model: Model, struct: T): void;
    /**
     * Writing dynamic array. Array length is written before array items.
     * <stringLength><string>
     */
    private _writeDynamicArray;
    /**
     * Writing dynamic string. String length is written before string.
     * <stringLength><string>
     */
    private _writeDynamicString;
    _write(model: Model, struct: T, key: string, type: string): void;
    toBuffer(): Buffer;
    get offset(): number;
    get size(): number;
    getBufferAndOffset(): (number | Buffer)[];
}
//# sourceMappingURL=make.d.ts.map