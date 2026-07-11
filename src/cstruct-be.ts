import { CStruct } from "./cstruct";
import { CStructReadResult, CStructWriteResult, Model, Types } from "./types";
import { MakeBE } from "./make-be";
import { WriteBE } from "./write-be";
import { ReadBE } from "./read-be";
import { CStructMetadata } from "./decorators-metadata";
import { Class, CStructClassOptions } from "./decorators-types";
import {
    compileMakeFromParsedModel,
    compileReadFromParsedModel,
    compileWriteFromParsedModel,
    compileMake,
    compileRead,
    compileWrite,
    CompiledMakeFn,
    CompiledReadFn,
    CompiledWriteFn,
} from "./codegen";

/**
 * C_Struct BE - Big Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStructBE<T> extends CStruct<T> {
    private constructor(model?: Model, types?: Types, compiledJsonModel?: string) {
        super(model, types, compiledJsonModel);
    }

    make<T = any>(struct: T): CStructWriteResult {
        const writer = new MakeBE<T>(this.parsedModel, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size
        }
    }

    write<T = any>(buffer: Buffer, struct: T, offset = 0): CStructWriteResult {
        const writer = new WriteBE<T>(this.parsedModel, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size
        }
    }

    read<T = any>(buffer: Buffer, offset = 0): CStructReadResult<T> {
        const reader = new ReadBE<T>(this.parsedModel, buffer, offset);
        return {
            struct: reader.toStruct(),
            offset: reader.offset,
            size: reader.size
        };
    }

    static make<T = any>(struct: T): CStructWriteResult {
        const cStruct = CStructMetadata.getCStructBE(struct);
        return cStruct.make(struct);
    }

    static write<T = any>(struct: T, buffer: Buffer, offset?: number) {
        const cStruct = CStructMetadata.getCStructBE(struct);
        return cStruct.write(buffer, struct, offset);
    }

    static read<T = any>(TClass: Class<T>, buffer: Buffer, offset?: number): CStructReadResult<T> {
        const instance = new TClass();
        const cStruct = CStructMetadata.getCStructBE(instance);
        const result = cStruct.read<T>(buffer, offset);
        result.struct = Object.assign(instance, result.struct);
        return result;
    }

    static from<T = any>(from: Class | CStructClassOptions | T): CStructBE<T> {
        return CStructMetadata.getCStructBE(from);
    }

    static fromModelTypes<T = any>(model: Model, types?: Types): CStructBE<T> {
        return new CStructBE<T>(model, types);
    }

    static fromCompiled<T = any>(jsonModel: string | Model): CStructBE<T> {
        const normalized = CStruct.normalizeCompiledJsonModel(jsonModel);
        return new CStructBE<T>(undefined, undefined, normalized);
    }

    compileRead<T = any>(): CompiledReadFn<T> {
        return compileReadFromParsedModel<T>(this.parsedModel, 'be');
    }

    compileWrite<T = any>(): CompiledWriteFn<T> {
        return compileWriteFromParsedModel<T>(this.parsedModel, 'be');
    }

    compileMake<T = any>(): CompiledMakeFn<T> {
        return compileMakeFromParsedModel<T>(this.parsedModel, 'be');
    }

    static compileRead<T = any>(model: Model, types?: Types): CompiledReadFn<T> {
        return compileRead<T>(model, types, 'be');
    }

    static compileWrite<T = any>(model: Model, types?: Types): CompiledWriteFn<T> {
        return compileWrite<T>(model, types, 'be');
    }

    static compileMake<T = any>(model: Model, types?: Types): CompiledMakeFn<T> {
        return compileMake<T>(model, types, 'be');
    }
}