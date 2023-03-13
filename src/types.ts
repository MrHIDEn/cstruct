export type WriterValue = number | string | bigint | boolean | Buffer;
export type ReaderValue = number | string | bigint | boolean | Buffer;
export type ModelValue = number | string | bigint | boolean | Buffer;
export type WriterFunctions = (val: WriterValue, size?: number) => void;
export type ReaderFunctions = (size?: number) => ReaderValue;

export type Model = object | ModelValue[] | string;
export type Types = object | string;
export type Type = object | string;
export type StructEntry = [key: string, type: Type];
export type Alias = string[]; // [type: string, ...aliases: string[]]

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

export interface CStructClassOptions {
    types?: Types;
}

export class CStructClass<T> {
    make(): CStructWriteResult {
        throw Error(`Not implemented.`);
    }
    write(buffer: Buffer, offset?: number): CStructWriteResult {
        throw Error(`Not implemented.`);
    }
    read(buffer: Buffer, offset?: number): CStructReadResult<T> {
        throw Error(`Not implemented.`);
    }
}