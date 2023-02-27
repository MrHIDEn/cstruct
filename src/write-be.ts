import { Alias, Model } from "./types";
import { Write } from "./write";
import { WriteBufferBE } from "./write-buffer-be";

export class WriteBE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset = 0, aliases: Alias[] = []) {
        super(buffer, offset);
        this._writer = new WriteBufferBE(aliases);
        this._recursion(model, struct);
    }
}