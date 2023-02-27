import { Alias, Model } from "./types";
import { WriteBufferBE } from "./write-buffer-be";
import { Make } from "./make";

export class MakeBE<T> extends Make<T> {
    constructor(model: Model, struct: T, aliases: Alias[] = []) {
        super();
        this._writer = new WriteBufferBE(aliases);
        this._recursion(model, struct);
    }
}