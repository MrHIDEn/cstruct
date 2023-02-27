import { Alias, Model } from "./types";
import { Read } from "./read";
import { ReadBufferBE } from "./read-buffer-be";

export class ReadBE<T> extends Read<T> {
    constructor(model: Model, buffer: Buffer, offset = 0, aliases: Alias[] = []) {
        super();
        this._reader = new ReadBufferBE(buffer, offset, aliases);
        this._struct = model as T;
        this._recursion(this._struct);
    }
}