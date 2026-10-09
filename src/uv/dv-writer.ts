import { WriterFunctions, WriterValue } from "../types";
import { BaseBuffer } from "../base-buffer";
import { writeUtf8 } from "./utf";

/**
 * Variant B (browser-ready): DataView-based writer into a single growing
 * Uint8Array. Mirrors the low-level writer surface used by the walkers:
 * `write(type, val, size?)`, `size`. No Buffer usage — strings via a fast UTF-8
 * writer / manual utf16le, numerics via DataView (endianness as a flag).
 */
export class DvWriter extends BaseBuffer {
    private _bytes: Uint8Array;
    private _view: DataView;
    private _offset = 0;
    private readonly _le: boolean;

    constructor(littleEndian = true) {
        super();
        this._le = littleEndian;
        this._bytes = new Uint8Array(64);
        this._view = new DataView(this._bytes.buffer);
        this._atomFunctions = new Map<string, WriterFunctions>([
            ['b8', (val) => this.i8(+Boolean(val))],
            ['b16', (val) => this.i16(+Boolean(val))],
            ['b32', (val) => this.i32(+Boolean(val))],
            ['b64', (val) => this.i64(BigInt(+Boolean(val)))],

            ['u8', (val) => this.u8(val as number)],
            ['u16', (val) => this.u16(val as number)],
            ['u32', (val) => this.u32(val as number)],
            ['u64', (val) => this.u64(val as number | bigint)],

            ['i8', (val) => this.i8(val as number)],
            ['i16', (val) => this.i16(val as number)],
            ['i32', (val) => this.i32(val as number)],
            ['i64', (val) => this.i64(val as number | bigint)],

            ['f', (val) => this.f(val as number)],
            ['d', (val) => this.d(val as number)],

            ['s', (val, size) => this.s(val as string, size)],
            ['ws', (val, size) => this.ws(val as string, size)],
            ['buf', (val, size) => this.buf(val as Uint8Array, size)],
            ['j', (val, size) => this.s(val as string, size)],
        ]);
        this.addPredefinedAliases();
    }

    /** Ensure the backing buffer can hold `n` more bytes, growing if needed. */
    private ensure(n: number) {
        if (this._offset + n > this._bytes.length) {
            const bigger = new Uint8Array(Math.max(this._bytes.length * 2, this._offset + n));
            bigger.set(this._bytes.subarray(0, this._offset));
            this._bytes = bigger;
            this._view = new DataView(this._bytes.buffer);
        }
    }

    /** Reset the cursor so this writer can be reused across calls (the backing buffer is kept). */
    reset() {
        this._offset = 0;
    }

    write(type: string, val: WriterValue, size?: number) {
        switch (type) {
            case 'u8': this.u8(val as number); return;
            case 'i8': this.i8(val as number); return;
            case 'b8': this.i8(+Boolean(val)); return;
            case 'u16': this.u16(val as number); return;
            case 'i16': this.i16(val as number); return;
            case 'u32': this.u32(val as number); return;
            case 'i32': this.i32(val as number); return;
            case 'u64': this.u64(val as number | bigint); return;
            case 'i64': this.i64(val as number | bigint); return;
            case 'f': this.f(val as number); return;
            case 'd': this.d(val as number); return;
            case 'b16': this.i16(+Boolean(val)); return;
            case 'b32': this.i32(+Boolean(val)); return;
            case 'b64': this.i64(BigInt(+Boolean(val))); return;
            case 's': this.s(val as string, size); return;
            case 'ws': this.ws(val as string, size); return;
            case 'buf': this.buf(val as Uint8Array, size); return;
            case 'j': this.s(val as string, size); return;
            default: {
                if (size === undefined) {
                    const groups = type.match(this._stringOrBufferAtomOrJsonGroups)?.groups;
                    if (groups) {
                        this.write(groups.type, val, +groups.size);
                        return;
                    }
                }
                const writer = this._atomFunctions.get(type);
                if (!writer) {
                    throw new Error(`Unknown type ${type}`);
                }
                (writer as WriterFunctions)(val, size);
            }
        }
    }

    get buffer(): Uint8Array {
        return this.toBytes();
    }

    toBytes(): Uint8Array {
        return this._bytes.slice(0, this._offset);
    }

    /** Duck-type compatibility with WriteBuffer.toBuffer() — variant B callers use toBytes(). */
    toBuffer(): Buffer {
        return this.toBytes() as unknown as Buffer;
    }

    get size(): number {
        return this._offset;
    }

    get offset(): number {
        return this._offset;
    }

    private u8(val = 0) {
        if (val < 0 || val > 0xff) {
            throw new Error(`Value ${val} out of range for u8.`);
        }
        this.ensure(1);
        this._view.setUint8(this._offset, val);
        this._offset += 1;
    }

    private i8(val = 0) {
        if (val < -0x80 || val > 0x7f) {
            throw new Error(`Value ${val} out of range for i8.`);
        }
        this.ensure(1);
        this._view.setInt8(this._offset, val);
        this._offset += 1;
    }

    private u16(val = 0) {
        this.ensure(2);
        this._view.setUint16(this._offset, val, this._le);
        this._offset += 2;
    }

    private i16(val = 0) {
        this.ensure(2);
        this._view.setInt16(this._offset, val, this._le);
        this._offset += 2;
    }

    private u32(val = 0) {
        this.ensure(4);
        this._view.setUint32(this._offset, val, this._le);
        this._offset += 4;
    }

    private i32(val = 0) {
        this.ensure(4);
        this._view.setInt32(this._offset, val, this._le);
        this._offset += 4;
    }

    private u64(val: number | bigint = 0) {
        this.ensure(8);
        this._view.setBigUint64(this._offset, BigInt(val), this._le);
        this._offset += 8;
    }

    private i64(val: number | bigint = 0) {
        this.ensure(8);
        this._view.setBigInt64(this._offset, BigInt(val), this._le);
        this._offset += 8;
    }

    private f(val = 0) {
        this.ensure(4);
        this._view.setFloat32(this._offset, val, this._le);
        this._offset += 4;
    }

    private d(val = 0) {
        this.ensure(8);
        this._view.setFloat64(this._offset, val, this._le);
        this._offset += 8;
    }

    private s(val = '', size?: number) {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }
        if (size === undefined) {
            size = val.length;
        } else {
            if (size < 0) {
                throw new Error(`Invalid string size ${size}`);
            }
            if (size === 0) {
                size = val.length + 1;
            }
        }
        this.ensure(size);
        this._bytes.fill(0, this._offset, this._offset + size);
        writeUtf8(this._bytes, this._offset, val, size);
        this._offset += size;
    }

    private ws(val = '', size?: number) {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }
        if (size === undefined) {
            size = val.length;
        } else {
            if (size < 0) {
                throw new Error(`Invalid string size ${size}`);
            }
            if (size === 0) {
                size = val.length + 1;
            }
        }
        const sizeBytes = size * 2; // utf16le: 2 bytes per character
        this.ensure(sizeBytes);
        this._bytes.fill(0, this._offset, this._offset + sizeBytes);
        for (let i = 0; i < val.length && i < size; i++) {
            const c = val.charCodeAt(i);
            this._bytes[this._offset + i * 2] = c & 0xff;
            this._bytes[this._offset + i * 2 + 1] = (c >> 8) & 0xff;
        }
        this._offset += sizeBytes;
    }

    private buf(val: Uint8Array = new Uint8Array(0), size?: number) {
        if (!(val instanceof Uint8Array)) {
            throw new Error(`Invalid buffer value ${val}`);
        }
        if (size === undefined) {
            this.ensure(val.length);
            this._bytes.set(val, this._offset);
            this._offset += val.length;
        } else {
            this.ensure(size);
            this._bytes.fill(0, this._offset, this._offset + size);
            this._bytes.set(val.subarray(0, size), this._offset);
            this._offset += size;
        }
    }
}
