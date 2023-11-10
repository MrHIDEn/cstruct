import { Model } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { Make } from "./make";

export class MakeLE<T> extends Make<T> {
    constructor(model: Model, struct: T) {
        super();
        this._writer = new WriteBufferLE();
        this._recursion(model, struct);
    }
}