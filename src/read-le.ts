import { Model } from "./types";
import { Read } from "./read";
import { ReadBufferLE } from "./read-buffer-le";

export class ReadLE<T> extends Read<T> {
    constructor(model?: Model, buffer?: Buffer, offset = 0) {
        super();
        this._reader = new ReadBufferLE(buffer ?? Buffer.alloc(0), offset);
        if (model !== undefined) {
            this._struct = this.readSchema(model) as T;
        }
    }

    /** Reuse this reader: rebind buffer/offset and re-walk the model. */
    read(model: Model, buffer: Buffer, offset = 0): T {
        this._reader.reset(buffer, offset);
        this._struct = this.readSchema(model) as T;
        return this._struct;
    }
}
