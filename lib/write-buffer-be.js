import { WriteBuffer } from "./write-buffer";
export class WriteBufferBE extends WriteBuffer {
    constructor() {
        super();
        [
            ['u16', (val = 0) => this._u16(val)],
            ['i16', (val = 0) => this._i16(val)],
            ['u32', (val = 0) => this._u32(val)],
            ['i32', (val = 0) => this._i32(val)],
            ['u64', (val = 0n) => this._u64(val)],
            ['i64', (val = 0n) => this._i64(val)],
            ['f', (val = 0) => this._f(val)],
            ['d', (val = 0) => this._d(val)],
        ].forEach(([type, writer]) => this._writers.set(type, writer));
    }
    _u16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16BE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }
    _i16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16BE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }
    _u32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }
    _i32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32BE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }
    _u64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64BE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }
    _i64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64BE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }
    _f(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatBE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }
    _d(val = 0) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleBE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }
}
//# sourceMappingURL=write-buffer-be.js.map