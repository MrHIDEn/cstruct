/// <reference types="node" />
import { Alias, Model } from "./types";
import { Read } from "./read";
export declare class ReadLE<T> extends Read<T> {
    constructor(model: Model, buffer: Buffer, offset?: number, aliases?: Alias[]);
}
//# sourceMappingURL=read-le.d.ts.map