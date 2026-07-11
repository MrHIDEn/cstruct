import { CStruct } from "./cstruct";
import { CStructReadResult, CStructWriteResult, Model, Types } from "./types";
import { MakeLE } from "./make-le";
import { WriteLE } from "./write-le";
import { ReadLE } from "./read-le";
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
 * C_Struct LE - Little Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStructLE<T> extends CStruct<T> {
    constructor(model?: Model, types?: Types, compiledJsonModel?: string) {
        super(model, types, compiledJsonModel);
    }

    make<T = any>(struct: T): CStructWriteResult {
        const writer = new MakeLE<T>(this.parsedModel, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size
        }
    }

    write<T = any>(buffer: Buffer, struct: T, offset = 0): CStructWriteResult {
        const writer = new WriteLE<T>(this.parsedModel, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size
        }
    }

    read<T = any>(buffer: Buffer, offset = 0): CStructReadResult<T> {
        const reader = new ReadLE<T>(this.parsedModel, buffer, offset);
        return {
            struct: reader.toStruct() as T,
            offset: reader.offset,
            size: reader.size
        };
    }

    static make<T = any>(struct: T): CStructWriteResult {
        const cStruct = CStructMetadata.getCStructLE(struct);
        return cStruct.make(struct);
    }

    static write<T = any>(struct: T, buffer: Buffer, offset?: number) {
        const cStruct = CStructMetadata.getCStructLE(struct);
        return cStruct.write(buffer, struct, offset);
    }

    static read<T = any>(TClass: Class<T>, buffer: Buffer, offset?: number): CStructReadResult<T> {
        const instance = new TClass();
        const cStruct = CStructMetadata.getCStructLE(instance);
        const result = cStruct.read<T>(buffer, offset);
        result.struct = Object.assign(instance, result.struct);
        return result;
    }

    static from<T = any>(from: Class | CStructClassOptions | T): CStructLE<T> {
        return CStructMetadata.getCStructLE(from);
    }

    static fromModelTypes<T = any>(model: Model, types?: Types): CStructLE<T> {
        return new CStructLE<T>(model, types);
    }

    static fromCompiled<T = any>(jsonModel: string | Model): CStructLE<T> {
        const normalized = CStruct.normalizeCompiledJsonModel(jsonModel);
        return new CStructLE<T>(undefined, undefined, normalized);
    }

    compileRead<T = any>(): CompiledReadFn<T> {
        return compileReadFromParsedModel<T>(this.parsedModel, 'le');
    }

    compileWrite<T = any>(): CompiledWriteFn<T> {
        return compileWriteFromParsedModel<T>(this.parsedModel, 'le');
    }

    compileMake<T = any>(): CompiledMakeFn<T> {
        return compileMakeFromParsedModel<T>(this.parsedModel, 'le');
    }

    static compileRead<T = any>(model: Model, types?: Types): CompiledReadFn<T> {
        return compileRead<T>(model, types, 'le');
    }

    static compileWrite<T = any>(model: Model, types?: Types): CompiledWriteFn<T> {
        return compileWrite<T>(model, types, 'le');
    }

    static compileMake<T = any>(model: Model, types?: Types): CompiledMakeFn<T> {
        return compileMake<T>(model, types, 'le');
    }
}