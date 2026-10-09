import { Model } from "../types";
import { Read } from "../read";
import { ReadBufferLE } from "../read-buffer-le";
import { DvReader } from "./dv-reader";

/**
 * Variant B walker — reuses the whole Read walker (dynamics, enums, JSON)
 * with a DataView-based reader. DvReader mirrors the reader surface
 * (read/size/offset), so the cast is duck-typing only.
 */
export class ReadUv<T> extends Read<T> {
    constructor(model?: Model, bytes?: Uint8Array, offset = 0, littleEndian = true) {
        super();
        this._reader = new DvReader(bytes ?? new Uint8Array(0), offset, littleEndian) as unknown as ReadBufferLE;
        if (model !== undefined) {
            this._struct = this.readSchema(model) as T;
        }
    }

    /** Reuse this reader: rebind bytes/offset and re-walk the model. */
    read(model: Model, bytes: Uint8Array, offset = 0): T {
        (this._reader as unknown as DvReader).reset(bytes, offset);
        this._struct = this.readSchema(model) as T;
        return this._struct;
    }
}
