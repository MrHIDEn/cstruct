import { Write } from "./write";
import { WriteBufferLE } from "./write-buffer-le";
export class WriteLE extends Write {
    constructor(model, struct, buffer, offset = 0, aliases = []) {
        super(buffer, offset);
        this._writer = new WriteBufferLE(aliases);
        this._recursion(model, struct);
    }
}
//# sourceMappingURL=write-le.js.map