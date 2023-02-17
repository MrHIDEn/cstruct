import { Make } from "./make";
export class Write extends Make {
    constructor(buffer, offset = 0) {
        super();
        this._buffer = buffer;
        this._offset = offset;
    }
    toBuffer() {
        this._writer.toBuffer().copy(this._buffer, this._offset);
        return this._buffer;
    }
    get offset() {
        return this._offset + this.size;
    }
}
//# sourceMappingURL=write.js.map