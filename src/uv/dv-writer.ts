import { WriterFunctions, WriterValue } from "../types";
import { BaseBuffer } from "../base-buffer";

/**
 * Variant B (browser-ready): DataView-based writer accumulating Uint8Array chunks.
 * Mirrors the low-level writer surface used by the walkers: `write(type, val, size?)`, `size`.
 * No Buffer usage — strings via TextEncoder (utf8) / manual utf16le, numerics via DataView.
 */
export class DvWriter extends BaseBuffer {
    private readonly _chunks: Uint8Array[] = [];
    private _offset = 0;
    private readonly _le: boolean;
    private readonly _scratch = new ArrayBuffer(8);
    private readonly _view = new DataView(this._scratch);
    private readonly _utf8Encoder = new TextEncoder();

    constructor(littleEndian = true) {
        super();
        this._le = littleEndian;
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
    }

    write(type: string, val: WriterValue, size?: number) {
        if (size === undefined) {
            const groups = type.match(this._stringOrBufferAtomOrJsonGroups)?.groups;
            if (groups) {
                type = groups.type;
                size = +groups.size;
            }
        }
        const writer = this._atomFunctions.get(type);
        if (!writer) {
            throw new Error(`Unknown type ${type}`);
        }
        (writer as WriterFunctions)(val, size);
    }

    get buffer(): Uint8Array {
        return this.toBytes();
    }

    toBytes(): Uint8Array {
        const out = new Uint8Array(this._offset);
        let pos = 0;
        for (const chunk of this._chunks) {
            out.set(chunk, pos);
            pos += chunk.length;
        }
        return out;
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

    private push(chunk: Uint8Array) {
        this._chunks.push(chunk);
        this._offset += chunk.length;
    }

    private pushScratch(bytes: number) {
        const out = new Uint8Array(bytes);
        out.set(new Uint8Array(this._scratch, 0, bytes));
        this.push(out);
    }

    private u8(val = 0) {
        if (val < 0 || val > 0xff) {
            throw new Error(`Value ${val} out of range for u8.`);
        }
        const out = new Uint8Array(1);
        out[0] = val;
        this.push(out);
    }

    private i8(val = 0) {
        if (val < -0x80 || val > 0x7f) {
            throw new Error(`Value ${val} out of range for i8.`);
        }
        const out = new Uint8Array(1);
        out[0] = val & 0xff;
        this.push(out);
    }

    private u16(val = 0) {
        this._view.setUint16(0, val, this._le);
        this.pushScratch(2);
    }

    private i16(val = 0) {
        this._view.setInt16(0, val, this._le);
        this.pushScratch(2);
    }

    private u32(val = 0) {
        this._view.setUint32(0, val, this._le);
        this.pushScratch(4);
    }

    private i32(val = 0) {
        this._view.setInt32(0, val, this._le);
        this.pushScratch(4);
    }

    private u64(val: number | bigint = 0) {
        this._view.setBigUint64(0, BigInt(val), this._le);
        this.pushScratch(8);
    }

    private i64(val: number | bigint = 0) {
        this._view.setBigInt64(0, BigInt(val), this._le);
        this.pushScratch(8);
    }

    private f(val = 0) {
        this._view.setFloat32(0, val, this._le);
        this.pushScratch(4);
    }

    private d(val = 0) {
        this._view.setFloat64(0, val, this._le);
        this.pushScratch(8);
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
        const out = new Uint8Array(size); // zero-filled, like Buffer.alloc
        this._utf8Encoder.encodeInto(val, out); // writes at most size bytes, at char boundary
        this.push(out);
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
        const out = new Uint8Array(sizeBytes);
        for (let i = 0; i < val.length && i < size; i++) {
            const c = val.charCodeAt(i);
            out[i * 2] = c & 0xff;
            out[i * 2 + 1] = (c >> 8) & 0xff;
        }
        this.push(out);
    }

    private buf(val: Uint8Array = new Uint8Array(0), size?: number) {
        if (!(val instanceof Uint8Array)) {
            throw new Error(`Invalid buffer value ${val}`);
        }
        let out: Uint8Array;
        if (size === undefined) {
            out = val;
        } else {
            out = new Uint8Array(size); // zero-filled, like Buffer.alloc
            out.set(val.subarray(0, size));
        }
        this.push(out);
    }
}
