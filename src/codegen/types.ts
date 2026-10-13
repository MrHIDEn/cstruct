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

export interface Hoist {
    /** Preamble lines emitted once, before both the size and write passes. */
    lines: string[];
    /** Maps a field path (e.g. `struct["meta"]`) to its hoisted temp variable. */
    vars: Map<string, string>;
}

export interface CodegenContext {
    endian: Endian;
    mode: CodegenMode;
    lines: string[];
    counter: number;
    useChunks: boolean;
    /** When true (make mode), emit `size += …` instead of buffer writes. */
    accumulateSize?: boolean;
    /** Nesting depth of emitted runtime loops (0 = top level, hoistable). */
    loopDepth: number;
    /** Shared hoist target across the two passes (write/make). */
    hoist?: Hoist;
}

export type ParsedModel = Model;
