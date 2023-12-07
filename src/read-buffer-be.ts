import { ReadBuffer } from "./read-buffer";
import { ReaderFunctions } from "./types";

export class ReadBufferBE extends ReadBuffer {
    u16() {
        const val = this._buffer.readUInt16BE(this._offset);
        this.moveOffset(2);
        return val;
    }

    i16() {
        const val = this._buffer.readInt16BE(this._offset);
        this.moveOffset(2);
        return val;
    }

    u32() {
        const val = this._buffer.readUInt32BE(this._offset);
        this.moveOffset(4);
        return val;
    }

    i32() {
        const val = this._buffer.readInt32BE(this._offset);
        this.moveOffset(4);
        return val;
    }

    u64() {
        const val = this._buffer.readBigUInt64BE(this._offset);
        this.moveOffset(8);
        return val;
    }

    i64() {
        const val = this._buffer.readBigInt64BE(this._offset);
        this.moveOffset(8);
        return val;
    }

    f() {
        const val = this._buffer.readFloatBE(this._offset);
        this.moveOffset(4);
        return val;
    }

    d() {
        const val = this._buffer.readDoubleBE(this._offset);
        this.moveOffset(8);
        return val;
    }

    constructor(buffer: Buffer, offset = 0) {
        super(buffer, offset);
        this._atomFunctions = new Map<string, ReaderFunctions>([
            ...[...this._atomFunctions],
            ['b16', () => Boolean(this.i16())],
            ['b32', () => Boolean(this.i32())],
            ['b64', () => Boolean(this.i64())],

            ['u16', () => this.u16()],
            ['u32', () => this.u32()],
            ['u64', () => this.u64()],

            ['i16', () => this.i16()],
            ['i32', () => this.i32()],
            ['i64', () => this.i64()],

            ['f', () => this.f()],
            ['d', () => this.d()],
        ]);

        this.addPredefinedAliases();
    }
}