import { CStruct } from "./cstruct";
import { CStructReadResult, CStructWriteResult, Model, Types } from "./types";
import { MakeLE } from "./make-le";
import { ReadLE } from "./read-le";
import { WriteLE } from "./write-le";
import { CStructMetadata } from "./decorators";

/**
 * C_Struct LE - Little Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStructLE<T> extends CStruct<T> {
    constructor(model: Model, types?: Types) {
        super(model, types);
    }

    make(struct: T): CStructWriteResult {
        const writer = new MakeLE<T>(this.modelClone, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
            toAtoms(): string[] {
                return writer.toAtoms();
            },
        }
    }

    write(buffer: Buffer, struct: T, offset = 0): CStructWriteResult {
        const writer = new WriteLE<T>(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
            toAtoms(): string[] {
                return writer.toAtoms();
            },
        }
    }

    read<T>(buffer: Buffer, offset = 0): CStructReadResult<T> {
        const reader = new ReadLE<T>(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct() as T,
            offset: reader.offset,
            size: reader.size,
            toAtoms(): string[] {
                return reader.toAtoms();
            },
        };
    }

    static make<T>(struct: T): CStructWriteResult {
        const cStruct = CStructMetadata.getCStructLE(struct);
        return cStruct.make(struct);
    }

    static write<T>(struct: T, buffer: Buffer, offset?: number) {
        const cStruct = CStructMetadata.getCStructLE(struct);
        return cStruct.write(buffer, struct, offset);
    }

    static read<T>(newableClass: new() => T, buffer: Buffer, offset?: number): CStructReadResult<T> {
        const instance = new newableClass();
        const cStruct = CStructMetadata.getCStructLE(instance);
        const result = cStruct.read<T>(buffer, offset);
        result.struct = Object.assign(instance, result.struct);
        return result;
    }
}