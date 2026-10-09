import { Model } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { Make } from "./make";

export class MakeLE<T> extends Make<T> {
    constructor(model?: Model, struct?: T) {
        super();
        this._writer = new WriteBufferLE();
        if (model !== undefined) {
            this.recursion(model, struct!);
        }
    }

    /** Reuse this writer: reset chunks and re-encode the model. */
    run(model: Model, struct: T) {
        (this._writer as WriteBufferLE).reset();
        this.recursion(model, struct);
    }
}
