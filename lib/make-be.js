import { WriteBufferBE } from "./write-buffer-be";
import { Make } from "./make";
export class MakeBE extends Make {
    constructor(model, struct, aliases = []) {
        super();
        this._writer = new WriteBufferBE(aliases);
        this._recursion(model, struct);
    }
}
//# sourceMappingURL=make-be.js.map