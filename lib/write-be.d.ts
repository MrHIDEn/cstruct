/// <reference types="node" />
import { Model } from "./types";
import { Write } from "./write";
export declare class WriteBE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset?: number);
}
//# sourceMappingURL=write-be.d.ts.map