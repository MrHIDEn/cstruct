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
    constructor(model: Model, bytes: Uint8Array, offset = 0, littleEndian = true) {
        super();
        this._reader = new DvReader(bytes, offset, littleEndian) as unknown as ReadBufferLE;
        this._struct = this.readSchema(model) as T;
    }
}
