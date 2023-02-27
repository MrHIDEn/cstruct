/// <reference types="node" />
import { Alias, Model } from "./types";
import { Write } from "./write";
export declare class WriteLE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset?: number, aliases?: Alias[]);
}
//# sourceMappingURL=write-le.d.ts.map