import { WriteBuffer } from "./write-buffer";
import { WriterFunctions } from "./types";

export class WriteBufferLE extends WriteBuffer {
    constructor() {
        super();
        this._writers = new Map<string, WriterFunctions>([
            ...this._writers,
            ['u16', (val = 0) => this._u16(val as number)],
            ['i16', (val = 0) => this._i16(val as number)],
            ['u32', (val = 0) => this._u32(val as number)],
            ['i32', (val = 0) => this._i32(val as number)],
            ['u64', (val = 0n) => this._u64(val as bigint)],
            ['i64', (val = 0n) => this._i64(val as bigint)],
            ['f', (val = 0) => this._f(val as number)],
            ['d', (val = 0) => this._d(val as number)],
        ]);
    }

    _u16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16LE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }

    _i16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16LE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }

    _u32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32LE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _i32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32LE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _u64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64LE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }

    _i64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64LE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }

    _f(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatLE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _d(val = 0) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleLE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }
}