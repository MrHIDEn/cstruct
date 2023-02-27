import { Make } from "./make";
export class Write extends Make {
    constructor(buffer, offset = 0) {
        super();
        this._buffer = buffer;
        this._offset = offset;
    }
    toBuffer() {
        const makeBuffer = this._writer.toBuffer();
        const leftSpace = this._buffer.length - this._offset;
        if (leftSpace < this.size) {
            throw Error(`Write buffer is too short. Needs ${this.size - leftSpace} byte/s more.`);
        }
        makeBuffer.copy(this._buffer, this._offset);
        return this._buffer;
    }
    get offset() {
        return this._offset + this.size;
    }
}
//# sourceMappingURL=write.js.map