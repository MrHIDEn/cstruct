import { WriteBufferLE } from "./write-buffer-le";
import { Make } from "./make";
export class MakeLE extends Make {
    constructor(model, struct, aliases = []) {
        super();
        this._writer = new WriteBufferLE(aliases);
        this._recursion(model, struct);
    }
}
//# sourceMappingURL=make-le.js.map