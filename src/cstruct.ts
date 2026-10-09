import { CStructReadResult, CStructWriteResult, Model, Types } from "./types";
import { CStructBE } from "./cstruct-be";
import { CStructLE } from "./cstruct-le";
import { CompiledMakeFn, CompiledReadFn, CompiledWriteFn } from "./codegen";

export type CStructEndian = 'le' | 'be';

export interface CStructOptions {
    /** Wire byte order. Default: 'le' (little endian). */
    endian?: CStructEndian;
}

function normalizeEndian(options?: CStructOptions): CStructEndian {
    const endian = options?.endian?.toLowerCase() as CStructEndian | undefined;
    if (endian !== undefined && endian !== 'le' && endian !== 'be') {
        throw new Error(`Invalid endian "${options.endian}". Use 'le' or 'be'.`);
    }
    return endian ?? 'le';
}

/**
 * C_Struct — default class with configurable byte order.
 *
 * Defaults to little endian (`CStructLE`); pass `{ endian: 'be' }` for big endian.
 * Both styles work:
 * - `new CStruct(model, { endian: 'be' })`
 * - `CStruct.fromModelTypes(model, types, { endian: 'be' })`
 */
export class CStruct<T = any> {
    private readonly _impl: CStructLE<T> | CStructBE<T>;

    /**
     * @param model   model (object/array/string) or, with `compiledJsonModel`, nothing
     * @param types   user types (or an options object — `new CStruct(model, { endian: 'be' })`)
     * @param options `{ endian: 'le' | 'be' }` — default 'le'
     * @param compiledJsonModel precompiled `jsonModel` (see `CStruct.fromCompiled`)
     */
    constructor(model?: Model, types?: Types, options?: CStructOptions, compiledJsonModel?: string | Model) {
        // Allow `new CStruct(model, { endian: 'be' })` — shift options to the right slot
        if (isOptions(types)) {
            options = types;
            types = undefined;
        }
        const endian = normalizeEndian(options);
        this._impl = compiledJsonModel !== undefined
            ? (endian === 'be' ? CStructBE.fromCompiled<T>(compiledJsonModel) : CStructLE.fromCompiled<T>(compiledJsonModel))
            : (endian === 'be' ? CStructBE.fromModelTypes<T>(model, types) : CStructLE.fromModelTypes<T>(model, types));
    }

    static fromModelTypes<T = any>(model: Model, types?: Types, options?: CStructOptions): CStruct<T> {
        return new CStruct<T>(model, types, options);
    }

    static fromCompiled<T = any>(jsonModel: string | Model, options?: CStructOptions): CStruct<T> {
        return new CStruct<T>(undefined, undefined, options, jsonModel);
    }

    make(struct: T): CStructWriteResult {
        return this._impl.make<T>(struct);
    }

    write(buffer: Buffer, struct: T, offset = 0): CStructWriteResult {
        return this._impl.write<T>(buffer, struct, offset);
    }

    read(buffer: Buffer, offset = 0): CStructReadResult<T> {
        return this._impl.read<T>(buffer, offset);
    }

    compileRead(): CompiledReadFn<T> {
        return this._impl.compileRead<T>();
    }

    compileWrite(): CompiledWriteFn<T> {
        return this._impl.compileWrite<T>();
    }

    compileMake(): CompiledMakeFn<T> {
        return this._impl.compileMake<T>();
    }

    get jsonTypes(): string {
        return this._impl.jsonTypes;
    }

    get jsonModel(): string {
        return this._impl.jsonModel;
    }

    get parsedModel(): Model {
        return this._impl.parsedModel;
    }

    get modelClone(): Model {
        return this._impl.modelClone;
    }
}

function isOptions(value: unknown): value is CStructOptions {
    return typeof value === 'object' && value !== null
        && !Array.isArray(value)
        && 'endian' in value
        && typeof (value as CStructOptions).endian === 'string';
}
