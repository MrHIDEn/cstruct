import { Model, Types } from '../types';
import { ModelParser } from '../model-parser';
import { analyzeModel } from '../codegen/model-analyzer';
import { generateMakeBodyDv, generateReadBodyDv, generateWriteBodyDv, DV_HELPERS } from './codegen-dv';
import { CompiledMakeUvFn, CompiledReadUvFn, CompiledWriteUvFn } from './codegen-dv';

function parseModel(model: Model, types?: Types): Model {
    const json = ModelParser.parseModel(model, types);
    return JSON.parse(json) as Model;
}

export function compileReadUvFromParsed<T = unknown>(parsed: Model, le: boolean): CompiledReadUvFn<T> {
    const body = generateReadBodyDv(parsed, le);
    const fn = new Function('bytes', 'off', '_h', body) as (bytes: Uint8Array, off: number | undefined, h: typeof DV_HELPERS) => ReturnType<CompiledReadUvFn<T>>;
    return ((bytes: Uint8Array, off?: number) => fn(bytes, off, DV_HELPERS)) as CompiledReadUvFn<T>;
}

export function compileWriteUvFromParsed<T = unknown>(parsed: Model, le: boolean): CompiledWriteUvFn<T> {
    const body = generateWriteBodyDv(parsed, le);
    const fn = new Function('struct', 'bytes', 'off', '_h', body) as (struct: any, bytes: Uint8Array, off: number | undefined, h: typeof DV_HELPERS) => ReturnType<CompiledWriteUvFn<T>>;
    return ((struct: any, bytes: Uint8Array, off?: number) => fn(struct, bytes, off, DV_HELPERS)) as CompiledWriteUvFn<T>;
}

export function compileMakeUvFromParsed<T = unknown>(parsed: Model, le: boolean): CompiledMakeUvFn<T> {
    const analysis = analyzeModel(parsed);
    const body = generateMakeBodyDv(parsed, le, analysis.hasVariableLength, analysis.staticSize);
    const fn = new Function('struct', '_h', body) as (struct: any, h: typeof DV_HELPERS) => ReturnType<CompiledMakeUvFn<T>>;
    return ((struct: any) => fn(struct, DV_HELPERS)) as CompiledMakeUvFn<T>;
}

export function compileReadUv<T = unknown>(model: Model, types: Types | undefined, le: boolean): CompiledReadUvFn<T> {
    return compileReadUvFromParsed<T>(parseModel(model, types), le);
}

export function compileWriteUv<T = unknown>(model: Model, types: Types | undefined, le: boolean): CompiledWriteUvFn<T> {
    return compileWriteUvFromParsed<T>(parseModel(model, types), le);
}

export function compileMakeUv<T = unknown>(model: Model, types: Types | undefined, le: boolean): CompiledMakeUvFn<T> {
    return compileMakeUvFromParsed<T>(parseModel(model, types), le);
}
