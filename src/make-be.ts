import { Model } from "./types";
import { WriteBufferBE } from "./write-buffer-be";
import { Make } from "./make";

export class MakeBE<T> extends Make<T> {
    constructor(model: Model, struct: T) {
        super();
        this._writer = new WriteBufferBE();
        this.recursion(model, struct);
    }
}