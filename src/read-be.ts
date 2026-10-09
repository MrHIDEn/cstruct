import { Model } from "./types";
import { Read } from "./read";
import { ReadBufferBE } from "./read-buffer-be";

export class ReadBE<T> extends Read<T> {
    constructor(model?: Model, buffer?: Buffer, offset = 0) {
        super();
        this._reader = new ReadBufferBE(buffer ?? Buffer.alloc(0), offset);
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
