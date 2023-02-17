import { ReadBuffer } from "./read-buffer";
import { ReaderFunctions } from "./types";

export class ReadBufferLE extends ReadBuffer {
    constructor(buffer: Buffer, offset = 0) {
        super(buffer, offset);
        this._readers = new Map<string, ReaderFunctions>([
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
        const val = this._buffer.readUInt16LE(this._offset);
        this._offset += 2;
        return val;
    }

    _i16() {
        const val = this._buffer.readInt16LE(this._offset);
        this._offset += 2;
        return val;
    }

    _u32() {
        const val = this._buffer.readUInt32LE(this._offset);
        this._offset += 4;
        return val;
    }

    _i32() {
        const val = this._buffer.readInt32LE(this._offset);
        this._offset += 4;
        return val;
    }

    _u64() {
        const val = this._buffer.readBigUInt64LE(this._offset);
        this._offset += 8;
        return val;
    }

    _i64() {
        const val = this._buffer.readBigInt64LE(this._offset);
        this._offset += 8;
        return val;
    }

    _f() {
        const val = this._buffer.readFloatLE(this._offset);
        this._offset += 4;
        return val;
    }

    _d() {
        const val = this._buffer.readDoubleLE(this._offset);
        this._offset += 8;
        return val;
    }
}