import { Alias, Model } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { Make } from "./make";

export class MakeLE<T> extends Make<T> {
    constructor(model: Model, struct: T, aliases: Alias[] = []) {
        super();
        this._writer = new WriteBufferLE(aliases);
        this._recursion(model, struct);
    }
}