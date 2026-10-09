import { CStructBase } from "../cstruct-base";
import { CStructReadResult, Model, Types } from "../types";
import { MakeUv } from "./make-uv";
import { ReadUv } from "./read-uv";
import { WriteUv } from "./write-uv";
import {
    CompiledMakeUvFn,
    CompiledReadUvFn,
    CompiledWriteUvFn,
} from "./codegen-dv";
import {
    compileMakeUv,
    compileMakeUvFromParsed,
    compileReadUv,
    compileReadUvFromParsed,
    compileWriteUv,
    compileWriteUvFromParsed,
} from "./compile-dv";

export type CStructUvEndian = 'le' | 'be';

export interface CStructUvOptions {
    /** Wire byte order. Default: 'le' (little endian). */
    endian?: CStructUvEndian;
}

export interface CStructUvWriteResult {
    /** Plain Uint8Array — no Buffer, browser-ready. */
    bytes: Uint8Array;
    offset: number;
    size: number;
}

function normalizeEndian(options?: CStructUvOptions): CStructUvEndian {
    const endian = options?.endian?.toLowerCase() as CStructUvEndian | undefined;
    if (endian !== undefined && endian !== 'le' && endian !== 'be') {
        throw new Error(`Invalid endian "${options.endian}". Use 'le' or 'be'.`);
    }
    return endian ?? 'le';
}

function isOptions(value: unknown): value is CStructUvOptions {
    // Deliberately narrow: only a valid `endian` value counts as an options
    // object, so a user-types map that happens to have an `endian` key
    // (e.g. `{ endian: 'u8' }`) is never mistaken for options.
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const endian = (value as CStructUvOptions).endian;
    return typeof endian === 'string' && (endian.toLowerCase() === 'le' || endian.toLowerCase() === 'be');
}

/**
 * Variant B (browser-ready) — C_Struct over Uint8Array/DataView, no Buffer.
 *
 * Same models, same walker logic (dynamics, enums, JSON) as the Buffer-based
 * classes; only the low-level reader/writer is swapped. Interop is byte-for-byte
 * compatible with CStructLE/CStructBE for the same model and endianness.
 *
 * Accepts any Uint8Array view (including Buffer and byteOffset slices);
 * `make()` returns a plain Uint8Array.
 *
 * Codegen (`compileRead/compileWrite/compileMake`) emits DataView-based code —
 * also browser-ready. Note: enum models are not supported in compiled functions
 * (same limitation as the Buffer codegen).
 *
 * Both styles work:
 * - `new CStructUint8Array(model, { endian: 'be' })`
 * - `CStructUint8Array.fromModelTypes(model, types, { endian: 'be' })`
 */
export class CStructUint8Array<T = any> extends CStructBase<T> {
    private readonly _littleEndian: boolean;

    /**
     * @param model   model (object/array/string) or, with `compiledJsonModel`, nothing
     * @param types   user types (or an options object — `new CStructUint8Array(model, { endian: 'be' })`)
     * @param options `{ endian: 'le' | 'be' }` — default 'le'
     * @param compiledJsonModel precompiled `jsonModel` (see `CStructUint8Array.fromCompiled`)
     */
    constructor(model?: Model, types?: Types, options?: CStructUvOptions, compiledJsonModel?: string | Model) {
        // Allow `new CStructUint8Array(model, { endian: 'be' })` — shift options to the right slot
        if (isOptions(types)) {
            options = types;
            types = undefined;
        }
        const littleEndian = normalizeEndian(options) === 'le';
        super(
            model,
            types,
            compiledJsonModel !== undefined ? CStructBase.normalizeCompiledJsonModel(compiledJsonModel) : undefined,
        );
        this._littleEndian = littleEndian;
    }

    static fromModelTypes<T = any>(model: Model, types?: Types, options?: CStructUvOptions): CStructUint8Array<T> {
        return new CStructUint8Array<T>(model, types, options);
    }

    static fromCompiled<T = any>(jsonModel: string | Model, options?: CStructUvOptions): CStructUint8Array<T> {
        return new CStructUint8Array<T>(undefined, undefined, options, jsonModel);
    }

    make(struct: T): CStructUvWriteResult {
        const writer = new MakeUv<T>(this.parsedModel, struct, this._littleEndian);
        return {
            bytes: writer.toBytes(),
            offset: writer.offset,
            size: writer.size,
        };
    }

    write(bytes: Uint8Array, struct: T, offset = 0): CStructUvWriteResult {
        const writer = new WriteUv<T>(this.parsedModel, struct, bytes, offset, this._littleEndian);
        writer.toBytes();
        return {
            bytes,
            offset: writer.offset,
            size: writer.size,
        };
    }

    read(bytes: Uint8Array, offset = 0): CStructReadResult<T> {
        const reader = new ReadUv<T>(this.parsedModel, bytes, offset, this._littleEndian);
        return {
            struct: reader.toStruct() as T,
            offset: reader.offset,
            size: reader.size,
        };
    }

    compileRead<T = any>(): CompiledReadUvFn<T> {
        return compileReadUvFromParsed<T>(this.parsedModel, this._littleEndian);
    }

    compileWrite<T = any>(): CompiledWriteUvFn<T> {
        return compileWriteUvFromParsed<T>(this.parsedModel, this._littleEndian);
    }

    compileMake<T = any>(): CompiledMakeUvFn<T> {
        return compileMakeUvFromParsed<T>(this.parsedModel, this._littleEndian);
    }

    static compileRead<T = any>(model: Model, types?: Types, options?: CStructUvOptions): CompiledReadUvFn<T> {
        return compileReadUv<T>(model, types, normalizeEndian(options) === 'le');
    }

    static compileWrite<T = any>(model: Model, types?: Types, options?: CStructUvOptions): CompiledWriteUvFn<T> {
        return compileWriteUv<T>(model, types, normalizeEndian(options) === 'le');
    }

    static compileMake<T = any>(model: Model, types?: Types, options?: CStructUvOptions): CompiledMakeUvFn<T> {
        return compileMakeUv<T>(model, types, normalizeEndian(options) === 'le');
    }
}
