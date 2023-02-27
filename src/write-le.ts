import { Alias, Model } from "./types";
import { Write } from "./write";
import { WriteBufferLE } from "./write-buffer-le";

export class WriteLE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset = 0, aliases: Alias[] = []) {
        super(buffer, offset);
        this._writer = new WriteBufferLE(aliases);
        this._recursion(model, struct);
    }
}