import { Model } from "./types";
import { Write } from "./write";
import { WriteBufferBE } from "./write-buffer-be";

export class WriteBE<T> extends Write<T> {
    constructor(model?: Model, struct?: T, buffer?: Buffer, offset = 0) {
        super(buffer ?? Buffer.alloc(0), offset);
        this._writer = new WriteBufferBE();
        if (model !== undefined) {
            this.recursion(model, struct!);
        }
    }

    /** Reuse this writer: rebind target and re-encode the model. */
    run(model: Model, struct: T, buffer: Buffer, offset = 0) {
        this._buffer = buffer;
        this._offset = offset;
        (this._writer as WriteBufferBE).reset();
        this.recursion(model, struct);
    }
}
