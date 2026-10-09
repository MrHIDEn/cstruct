import { CStructBase } from "./cstruct-base";
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
export class CStructBE<T> extends CStructBase<T> {
    private _makeWriter?: MakeBE<any>;
    private _writeWriter?: WriteBE<any>;
    private _reader?: ReadBE<any>;

    private constructor(model?: Model, types?: Types, compiledJsonModel?: string) {
        super(model, types, compiledJsonModel);
    }

    make<T = any>(struct: T): CStructWriteResult {
        if (!this._makeWriter) this._makeWriter = new MakeBE();
        this._makeWriter.run(this.parsedModel, struct);
        return {
            buffer: this._makeWriter.toBuffer(),
            offset: this._makeWriter.offset,
            size: this._makeWriter.size
        }
    }

    write<T = any>(buffer: Buffer, struct: T, offset = 0): CStructWriteResult {
        if (!this._writeWriter) this._writeWriter = new WriteBE();
        this._writeWriter.run(this.parsedModel, struct, buffer, offset);
        return {
            buffer: this._writeWriter.toBuffer(),
            offset: this._writeWriter.offset,
            size: this._writeWriter.size
        }
    }

    read<T = any>(buffer: Buffer, offset = 0): CStructReadResult<T> {
        if (!this._reader) this._reader = new ReadBE();
        const struct = this._reader.read(this.parsedModel, buffer, offset);
        return {
            struct: struct as T,
            offset: this._reader.offset,
            size: this._reader.size
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
        const normalized = CStructBase.normalizeCompiledJsonModel(jsonModel);
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