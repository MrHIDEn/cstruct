import { Model } from "./types";
import { Write } from "./write";
import { WriteBufferLE } from "./write-buffer-le";

export class WriteLE<T> extends Write<T> {
    constructor(model?: Model, struct?: T, buffer?: Buffer, offset = 0) {
        super(buffer ?? Buffer.alloc(0), offset);
        this._writer = new WriteBufferLE();
        if (model !== undefined) {
            this.recursion(model, struct!);
        }
    }

    /** Reuse this writer: rebind target and re-encode the model. */
    run(model: Model, struct: T, buffer: Buffer, offset = 0) {
        this._buffer = buffer;
        this._offset = offset;
        (this._writer as WriteBufferLE).reset();
        this.recursion(model, struct);
    }
}
