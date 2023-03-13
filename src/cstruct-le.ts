import { CStruct } from "./cstruct";
import { ReadLE } from "./read-le";
import { CStructReadResult, CStructWriteResult, Model, Types, CStructDecoratorProperties } from "./types";
import { WriteLE } from "./write-le";
import { MakeLE } from "./make-le";

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

    read(buffer: Buffer, offset = 0): CStructReadResult<T> {
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

    private static getCStruct<T>(struct: T): CStructLE<T> {
        const decoratedStruct = struct as CStructDecoratorProperties<T>;
        if (!decoratedStruct.__cStruct) {
            if (!decoratedStruct.__cStructModel) {
                throw Error(`Provided struct is not decorated.`);
            }
            decoratedStruct.__cStruct = new CStructLE(decoratedStruct.__cStructModel, decoratedStruct.__cStructTypes);
        }
        return decoratedStruct.__cStruct;
    }

    static make<T>(struct: T): CStructWriteResult {
        return this.getCStruct(struct).make(struct);
    }

    static write<T>(struct: T, buffer: Buffer, offset?: number) {
        return this.getCStruct(struct).write(buffer, struct, offset);
    }

    static read<T>(struct: T, buffer: Buffer, offset?: number): CStructReadResult<T> {
        const result = this.getCStruct(struct).read(buffer, offset);
        Object.assign(struct, result.struct);
        return result;
    }
}