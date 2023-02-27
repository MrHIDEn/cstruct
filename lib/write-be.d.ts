/// <reference types="node" />
import { Alias, Model } from "./types";
import { Write } from "./write";
export declare class WriteBE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset?: number, aliases?: Alias[]);
}
//# sourceMappingURL=write-be.d.ts.map