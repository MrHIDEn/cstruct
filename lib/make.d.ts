/// <reference types="node" />
import { Model } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
export declare class Make<T> {
    protected _writer: WriteBufferLE | WriteBufferBE;
    private _dynamicLengthRegex;
    _recursion(model: Model, struct: T): void;
    private _writeDynamicItem;
    _write(model: Model, struct: T, key: string, type: string): void;
    toBuffer(): Buffer;
    get offset(): number;
    get size(): number;
    getBufferAndOffset(): (number | Buffer)[];
    toAtoms(): string[];
}
//# sourceMappingURL=make.d.ts.map