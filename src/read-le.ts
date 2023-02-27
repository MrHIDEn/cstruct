import { Alias, Model } from "./types";
import { Read } from "./read";
import { ReadBufferLE } from "./read-buffer-le";

export class ReadLE<T> extends Read<T> {
    constructor(model: Model, buffer: Buffer, offset = 0, aliases: Alias[] = []) {
        super();
        this._reader = new ReadBufferLE(buffer, offset, aliases);
        this._struct = model as T;
        this._recursion(this._struct);
    }
}