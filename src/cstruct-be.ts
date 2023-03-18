import { CStruct } from "./cstruct";
import { CStructReadResult, CStructWriteResult, Model, Types } from "./types";
import { MakeBE } from "./make-be";
import { WriteBE } from "./write-be";
import { ReadBE } from "./read-be";
import { CStructMetadata } from "./decorators";

/**
 * C_Struct BE - Big Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStructBE<T> extends CStruct<T> {
    constructor(model: Model, types?: Types) {
        super(model, types);
    }

    make(struct: T): CStructWriteResult {
        const writer = new MakeBE<T>(this.modelClone, struct);
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
        const writer = new WriteBE<T>(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
            toAtoms(): string[] {
                return writer.toAtoms();
            },
        }
    }

    read(buffer: Buffer, offset = 0): CStructReadResult<T> {
        const reader = new ReadBE<T>(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct(),
            offset: reader.offset,
            size: reader.size,
            toAtoms(): string[] {
                return reader.toAtoms();
            },
        };
    }

    static make<T>(struct: T): CStructWriteResult {
        const cStruct = CStructMetadata.getCStructBE(struct);
        return cStruct.make(struct);
    }

    static write<T>(struct: T, buffer: Buffer, offset?: number) {
        const cStruct = CStructMetadata.getCStructBE(struct);
        return cStruct.write(buffer, struct, offset);
    }

    static read<T>(newableClass: new() => T, buffer: Buffer, offset?: number): CStructReadResult<T> {
        const instance = new newableClass();
        const cStruct = CStructMetadata.getCStructBE(instance);
        const result = cStruct.read(buffer, offset);
        result.struct = Object.assign(instance, result.struct);
        return result;
    }
}