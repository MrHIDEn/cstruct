import { WriteBuffer } from "./write-buffer";
export class WriteBufferBE extends WriteBuffer {
    constructor() {
        super();
        this._writers = new Map([
            ...this._writers,
            ['u16', (val = 0) => this._u16(val)],
            ['i16', (val = 0) => this._i16(val)],
            ['u32', (val = 0) => this._u32(val)],
            ['i32', (val = 0) => this._i32(val)],
            ['u64', (val = 0n) => this._u64(val)],
            ['i64', (val = 0n) => this._i64(val)],
            ['f', (val = 0) => this._f(val)],
            ['d', (val = 0) => this._d(val)],
        ]);
    }
    _u16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16BE(val);
        this.addAtom('u16', buffer);
    }
    _i16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16BE(val);
        this.addAtom('i16', buffer);
    }
    _u32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(val);
        this.addAtom('u32', buffer);
    }
    _i32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32BE(val);
        this.addAtom('i32', buffer);
    }
    _u64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64BE(val);
        this.addAtom('u64', buffer);
    }
    _i64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64BE(val);
        this.addAtom('i64', buffer);
    }
    _f(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatBE(val);
        this.addAtom('f', buffer);
    }
    _d(val = 0) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleBE(val);
        this.addAtom('d', buffer);
    }
}
//# sourceMappingURL=write-buffer-be.js.map