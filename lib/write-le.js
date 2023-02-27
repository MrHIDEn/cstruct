import { Write } from "./write";
import { WriteBufferLE } from "./write-buffer-le";
export class WriteLE extends Write {
    constructor(model, struct, buffer, offset = 0) {
        super(buffer, offset);
        this._writer = new WriteBufferLE();
        this._recursion(model, struct);
    }
}
//# sourceMappingURL=write-le.js.map