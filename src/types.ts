export type WriterValue = number | string | bigint | boolean;
export type ReaderValue = number | string | bigint | boolean;
export type ModelValue = number | string | bigint | boolean;
export type WriterFunctions = (val: WriterValue, size?: number) => void;
export type ReaderFunctions = (size?: number) => ReaderValue;

export type Model = object | ModelValue[] | string;
export type Types = object | ModelValue[] | string;

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