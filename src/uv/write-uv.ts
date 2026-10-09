import { Model } from "../types";
import { Make } from "../make";
import { WriteBufferLE } from "../write-buffer-le";
import { DvWriter } from "./dv-writer";

/**
 * Variant B — write encoded bytes into a pre-allocated Uint8Array at a given offset.
 * Encoding logic lives in Make (via recursion); this class copies the result into the target.
 */
export class WriteUv<T> extends Make<T> {
    private _target: Uint8Array;
    private _targetOffset: number;

    constructor(model?: Model, struct?: T, target?: Uint8Array, offset = 0, littleEndian = true) {
        super();
        this._writer = new DvWriter(littleEndian) as unknown as WriteBufferLE;
        this._target = target ?? new Uint8Array(0);
        this._targetOffset = offset;
        if (model !== undefined) {
            this.recursion(model, struct!);
        }
    }

    /** Reuse this writer: rebind target and re-encode the model. */
    run(model: Model, struct: T, target: Uint8Array, offset = 0) {
        this._target = target;
        this._targetOffset = offset;
        (this._writer as unknown as DvWriter).reset();
        this.recursion(model, struct);
    }

    // Encode struct into an internal buffer, then set it into the target at _targetOffset
    toBytes(): Uint8Array {
        const made = (this._writer as unknown as DvWriter).toBytes();
        const leftSpace = this._target.length - this._targetOffset;
        if (leftSpace < made.length) {
            throw Error(`Write buffer is too short. Needs ${made.length - leftSpace} byte/s more.`);
        }
        this._target.set(made, this._targetOffset);
        return this._target;
    }

    // Cursor position after the write (start offset + bytes written)
    get offset(): number {
        return this._targetOffset + this.size;
    }
}
