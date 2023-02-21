import { ReadBuffer } from "./read-buffer";
export class ReadBufferBE extends ReadBuffer {
    constructor(buffer, offset = 0) {
        super(buffer, offset);
        this._readers = new Map([
            ...this._readers,
            ['u16', () => this._u16()],
            ['i16', () => this._i16()],
            ['u32', () => this._u32()],
            ['i32', () => this._i32()],
            ['u64', () => this._u64()],
            ['i64', () => this._i64()],
            ['f', () => this._f()],
            ['d', () => this._d()],
        ]);
    }
    _u16() {
        const val = this._buffer.readUInt16BE(this._offset);
        this._offset += 2;
        return val;
    }
    _i16() {
        const val = this._buffer.readInt16BE(this._offset);
        this._offset += 2;
        return val;
    }
    _u32() {
        const val = this._buffer.readUInt32BE(this._offset);
        this._offset += 4;
        return val;
    }
    _i32() {
        const val = this._buffer.readInt32BE(this._offset);
        this._offset += 4;
        return val;
    }
    _u64() {
        const val = this._buffer.readBigUInt64BE(this._offset);
        this._offset += 8;
        return val;
    }
    _i64() {
        const val = this._buffer.readBigInt64BE(this._offset);
        this._offset += 8;
        return val;
    }
    _f() {
        const val = this._buffer.readFloatBE(this._offset);
        this._offset += 4;
        return val;
    }
    _d() {
        const val = this._buffer.readDoubleBE(this._offset);
        this._offset += 8;
        return val;
    }
}
//# sourceMappingURL=read-buffer-be.js.map