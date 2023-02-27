import { ReadBuffer } from "./read-buffer";
import { Alias, ReaderFunctions } from "./types";

export class ReadBufferBE extends ReadBuffer {
    _u16() {
        const val = this._buffer.readUInt16BE(this._offset);
        this.addAtom('u16', 2);
        return val;
    }

    _i16() {
        const val = this._buffer.readInt16BE(this._offset);
        this.addAtom('i16', 2);
        return val;
    }

    _u32() {
        const val = this._buffer.readUInt32BE(this._offset);
        this.addAtom('u32', 4);
        return val;
    }

    _i32() {
        const val = this._buffer.readInt32BE(this._offset);
        this.addAtom('i32', 4);
        return val;
    }

    _u64() {
        const val = this._buffer.readBigUInt64BE(this._offset);
        this.addAtom('u64', 8);
        return val;
    }

    _i64() {
        const val = this._buffer.readBigInt64BE(this._offset);
        this.addAtom('i64', 8);
        return val;
    }

    _f() {
        const val = this._buffer.readFloatBE(this._offset);
        this.addAtom('f', 4);
        return val;
    }

    _d() {
        const val = this._buffer.readDoubleBE(this._offset);
        this.addAtom('d', 8);
        return val;
    }

    constructor(buffer: Buffer, offset = 0, aliases: Alias[]) {
        super(buffer, offset);
        this._atomFunctions = new Map<string, ReaderFunctions>([
            ...this._atomFunctions,
            ['b16', () => Boolean(this._i16())],
            ['b32', () => Boolean(this._i32())],
            ['b64', () => Boolean(this._i64())],

            ['u16', () => this._u16()],
            ['u32', () => this._u32()],
            ['u64', () => this._u64()],

            ['i16', () => this._i16()],
            ['i32', () => this._i32()],
            ['i64', () => this._i64()],

            ['f', () => this._f()],
            ['d', () => this._d()],
        ]);

        this.addPredefinedAliases();

        this.addUserAliases(aliases);
    }
}