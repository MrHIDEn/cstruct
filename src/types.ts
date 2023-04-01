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
}

export interface CStructWriteResult {
    buffer: Buffer;
    offset: number;
    size: number;
}

export enum SpecialType {
    String = 0,
    Buffer = 1,
    Json = 2,
}