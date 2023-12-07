import { WriteBuffer } from "./write-buffer";
import { WriterFunctions } from "./types";

export class WriteBufferBE extends WriteBuffer {
    u16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16BE(val);
        this.moveOffset(buffer);
    }

    i16(val = 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16BE(val);
        this.moveOffset(buffer);
    }

    u32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(val);
        this.moveOffset(buffer);
    }

    i32(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32BE(val);
        this.moveOffset(buffer);
    }

    u64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64BE(val);
        this.moveOffset(buffer);
    }

    i64(val = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64BE(val);
        this.moveOffset(buffer);
    }

    f(val = 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatBE(val);
        this.moveOffset(buffer);
    }

    d(val = 0) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleBE(val);
        this.moveOffset(buffer);
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