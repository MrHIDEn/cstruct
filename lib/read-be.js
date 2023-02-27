import { Read } from "./read";
import { ReadBufferBE } from "./read-buffer-be";
export class ReadBE extends Read {
    constructor(model, buffer, offset = 0, aliases = []) {
        super();
        this._reader = new ReadBufferBE(buffer, offset, aliases);
        this._struct = model;
        this._recursion(this._struct);
    }
}
//# sourceMappingURL=read-be.js.map