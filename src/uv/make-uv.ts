import { Model } from "../types";
import { Make } from "../make";
import { WriteBufferLE } from "../write-buffer-le";
import { DvWriter } from "./dv-writer";

/**
 * Variant B walker — reuses the whole Make walker (dynamics, enums, JSON)
 * with a DataView-based writer. DvWriter mirrors the writer surface
 * (write/size/toBuffer), so the cast is duck-typing only.
 */
export class MakeUv<T> extends Make<T> {
    constructor(model: Model, struct: T, littleEndian = true) {
        super();
        this._writer = new DvWriter(littleEndian) as unknown as WriteBufferLE;
        this.recursion(model, struct);
    }

    toBytes(): Uint8Array {
        return (this._writer as unknown as DvWriter).toBytes();
    }
}
