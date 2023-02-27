import { WriteBufferBE } from "./write-buffer-be";
import { Make } from "./make";
export class MakeBE extends Make {
    constructor(model, struct) {
        super();
        this._writer = new WriteBufferBE();
        this._recursion(model, struct);
    }
}
//# sourceMappingURL=make-be.js.map