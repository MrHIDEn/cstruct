import { Model } from "./types";
import { WriteBufferBE } from "./write-buffer-be";
import { Make } from "./make";

export class MakeBE<T> extends Make<T> {
    constructor(model?: Model, struct?: T) {
        super();
        this._writer = new WriteBufferBE();
        if (model !== undefined) {
            this.recursion(model, struct!);
        }
    }

    /** Reuse this writer: reset chunks and re-encode the model. */
    run(model: Model, struct: T) {
        (this._writer as WriteBufferBE).reset();
        this.recursion(model, struct);
    }
}
