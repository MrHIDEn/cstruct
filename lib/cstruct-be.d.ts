/// <reference types="node" />
import { CStruct } from "./cstruct";
import { Alias, CStructReadResult, CStructWriteResult, Model, Types } from "./types";
/**
 * C_Struct BE - Big Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export declare class CStructBE<T> extends CStruct<T> {
    constructor(model: Model, types?: Types, aliases?: Alias[]);
    read(buffer: Buffer, offset?: number): CStructReadResult<T>;
    write(buffer: Buffer, struct: T, offset?: number): CStructWriteResult;
    make(struct: T): CStructWriteResult;
}
//# sourceMappingURL=cstruct-be.d.ts.map