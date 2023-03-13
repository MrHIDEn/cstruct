import { CStruct } from "./cstruct";
import { CStructDecoratorProperties, CStructReadResult, CStructWriteResult, Model, Types } from "./types";
import { ReadBE } from "./read-be";
import { WriteBE } from "./write-be";
import { MakeBE } from "./make-be";

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

    private static getCStruct<T>(struct: T): CStructBE<T> {
        const decoratedStruct = struct as CStructDecoratorProperties<T>;
        if (!decoratedStruct.__cStruct) {
            if (!decoratedStruct.__cStructModel) {
                throw Error(`Provided struct is not decorated.`);
            }
            decoratedStruct.__cStruct = new CStructBE(decoratedStruct.__cStructModel, decoratedStruct.__cStructTypes);
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