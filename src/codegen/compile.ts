import { Model, Types } from '../types';
import { ModelParser } from '../model-parser';
import { analyzeModel } from './model-analyzer';
import { generateMakeBody, generateReadBody, generateWriteBody } from './generate';
import {
    CompiledMakeFn,
    CompiledReadFn,
    CompiledWriteFn,
    Endian,
} from './types';

function parseModel(model: Model, types?: Types): Model {
    const json = ModelParser.parseModel(model, types);
    return JSON.parse(json) as Model;
}

function compileReadFromParsed<T>(parsed: Model, endian: Endian): CompiledReadFn<T> {
    const body = generateReadBody(parsed, endian);
    return new Function('buf', 'off', body) as CompiledReadFn<T>;
}

function compileWriteFromParsed<T>(parsed: Model, endian: Endian): CompiledWriteFn<T> {
    const body = generateWriteBody(parsed, endian);
    return new Function('struct', 'buf', 'off', body) as CompiledWriteFn<T>;
}

function compileMakeFromParsed<T>(parsed: Model, endian: Endian): CompiledMakeFn<T> {
    const analysis = analyzeModel(parsed);
    const body = generateMakeBody(parsed, endian, analysis.hasVariableLength, analysis.staticSize);
    return new Function('struct', body) as CompiledMakeFn<T>;
}

export function compileRead<T = unknown>(model: Model, types: Types | undefined, endian: Endian): CompiledReadFn<T> {
    return compileReadFromParsed<T>(parseModel(model, types), endian);
}

export function compileWrite<T = unknown>(model: Model, types: Types | undefined, endian: Endian): CompiledWriteFn<T> {
    return compileWriteFromParsed<T>(parseModel(model, types), endian);
}

export function compileMake<T = unknown>(model: Model, types: Types | undefined, endian: Endian): CompiledMakeFn<T> {
    return compileMakeFromParsed<T>(parseModel(model, types), endian);
}

export function compileReadFromParsedModel<T = unknown>(parsed: Model, endian: Endian): CompiledReadFn<T> {
    return compileReadFromParsed<T>(parsed, endian);
}

export function compileWriteFromParsedModel<T = unknown>(parsed: Model, endian: Endian): CompiledWriteFn<T> {
    return compileWriteFromParsed<T>(parsed, endian);
}

export function compileMakeFromParsedModel<T = unknown>(parsed: Model, endian: Endian): CompiledMakeFn<T> {
    return compileMakeFromParsed<T>(parsed, endian);
}
