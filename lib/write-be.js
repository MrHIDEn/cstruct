import { Write } from "./write";
import { WriteBufferBE } from "./write-buffer-be";
export class WriteBE extends Write {
    constructor(model, struct, buffer, offset = 0, aliases = []) {
        super(buffer, offset);
        this._writer = new WriteBufferBE(aliases);
        this._recursion(model, struct);
    }
}
//# sourceMappingURL=write-be.js.map