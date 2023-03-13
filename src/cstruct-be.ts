import { CStruct } from "./cstruct";
import { CStructClass, CStructReadResult, CStructWriteResult, Model, Types } from "./types";
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

    static make<CStructBEClass>(struct: CStructBEClass): CStructWriteResult {
        return (struct as CStructClass<CStructBEClass>).make();
    }

    static write<CStructBEClass>(struct: CStructBEClass, buffer: Buffer, offset?: number) {
        return (struct as CStructClass<CStructBEClass>).write(buffer, offset);
    }

    static read<CStructBEClass>(struct: CStructBEClass, buffer: Buffer, offset?: number): CStructReadResult<CStructBEClass> {
        return (struct as CStructClass<CStructBEClass>).read(buffer, offset);
    }
}