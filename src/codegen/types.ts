import { CStructReadResult, CStructWriteResult, Model } from '../types';

export type Endian = 'le' | 'be';
export type CodegenMode = 'read' | 'write' | 'make';

export type CompiledReadFn<T = unknown> = (buf: Buffer, off?: number) => CStructReadResult<T>;
export type CompiledWriteFn<T = unknown> = (struct: T, buf: Buffer, off?: number) => CStructWriteResult;
export type CompiledMakeFn<T = unknown> = (struct: T) => CStructWriteResult;

export interface ModelAnalysis {
    hasVariableLength: boolean;
    staticSize: number;
}

export interface CodegenContext {
    endian: Endian;
    mode: CodegenMode;
    lines: string[];
    counter: number;
    useChunks: boolean;
    /** When true (make mode), emit `size += …` instead of buffer writes. */
    accumulateSize?: boolean;
}

export type ParsedModel = Model;
