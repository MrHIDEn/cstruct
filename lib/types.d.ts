/// <reference types="node" />
export type WriterValue = number | string | bigint | boolean;
export type ReaderValue = number | string | bigint | boolean;
export type ModelValue = number | string | bigint | boolean;
export type WriterFunctions = (val: WriterValue, size?: number) => void;
export type ReaderFunctions = (size?: number) => ReaderValue;
export type Model = object | ModelValue[] | string;
export type Types = object | string;
export type Type = object | string;
export type StructEntry = [key: string, type: Type];
export type Alias = string[];
export interface CStructReadResult<T> {
    struct: T;
    offset: number;
    size: number;
    toAtoms: () => string[];
}
export interface CStructWriteResult {
    buffer: Buffer;
    offset: number;
    size: number;
    toAtoms: () => string[];
}
//# sourceMappingURL=types.d.ts.map