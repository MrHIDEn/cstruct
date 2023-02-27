import { Read } from "./read";
import { ReadBufferLE } from "./read-buffer-le";
export class ReadLE extends Read {
    constructor(model, buffer, offset = 0, aliases = []) {
        super();
        this._reader = new ReadBufferLE(buffer, offset, aliases);
        this._struct = model;
        this._recursion(this._struct);
    }
}
//# sourceMappingURL=read-le.js.map