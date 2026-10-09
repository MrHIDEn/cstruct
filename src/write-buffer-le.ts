import { WriteBuffer } from "./write-buffer";
import { WriterFunctions } from "./types";

export class WriteBufferLE extends WriteBuffer {
    u16(val = 0) {
        this.ensure(2);
        this._buffer.writeUInt16LE(val, this._offset);
        this._offset += 2;
    }

    i16(val = 0) {
        this.ensure(2);
        this._buffer.writeInt16LE(val, this._offset);
        this._offset += 2;
    }

    u32(val = 0) {
        this.ensure(4);
        this._buffer.writeUInt32LE(val, this._offset);
        this._offset += 4;
    }

    i32(val = 0) {
        this.ensure(4);
        this._buffer.writeInt32LE(val, this._offset);
        this._offset += 4;
    }

    u64(val = 0n) {
        this.ensure(8);
        this._buffer.writeBigUInt64LE(val, this._offset);
        this._offset += 8;
    }

    i64(val = 0n) {
        this.ensure(8);
        this._buffer.writeBigInt64LE(val, this._offset);
        this._offset += 8;
    }

    f(val = 0) {
        this.ensure(4);
        this._buffer.writeFloatLE(val, this._offset);
        this._offset += 4;
    }

    d(val = 0) {
        this.ensure(8);
        this._buffer.writeDoubleLE(val, this._offset);
        this._offset += 8;
    }

    constructor() {
        super();
        this._atomFunctions = new Map<string, WriterFunctions>([
            ...[...this._atomFunctions],
            ['b16', (val: boolean) => this.i16(+Boolean(val))],
            ['b32', (val: boolean) => this.i32(+Boolean(val))],
            ['b64', (val: boolean) => this.i64(BigInt(val))],

            ['u16', (val = 0) => this.u16(val as number)],
            ['u32', (val = 0) => this.u32(val as number)],
            ['u64', (val = 0n) => this.u64(val as bigint)],

            ['i16', (val = 0) => this.i16(val as number)],
            ['i32', (val = 0) => this.i32(val as number)],
            ['i64', (val = 0n) => this.i64(val as bigint)],

            ['f', (val = 0) => this.f(val as number)],
            ['d', (val = 0) => this.d(val as number)],
        ]);

        this.addPredefinedAliases();
    }
}
