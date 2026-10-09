import { ReaderFunctions, ReaderValue } from "../types";
import { BaseBuffer } from "../base-buffer";

/**
 * Variant B (browser-ready): DataView-based reader working on any Uint8Array view.
 * Mirrors the low-level reader surface used by the walkers: `read(type, size?)`, `size`, `offset`.
 * No Buffer usage — strings via TextDecoder, numerics via DataView (endianness as a flag).
 */
export class DvReader extends BaseBuffer {
    private _bytes: Uint8Array;
    private _view: DataView;
    private readonly _le: boolean;
    private _offset: number;
    private _beginOffset: number;
    private readonly _utf8Decoder = new TextDecoder('utf-8');
    private readonly _utf16Decoder = new TextDecoder('utf-16le');

    constructor(bytes: Uint8Array, offset = 0, littleEndian = true) {
        super();
        this._bytes = bytes;
        this._view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        this._le = littleEndian;
        this._offset = offset;
        this._beginOffset = offset;
        this._atomFunctions = new Map<string, ReaderFunctions>([
            ['b8', () => Boolean(this.i8())],
            ['b16', () => Boolean(this.i16())],
            ['b32', () => Boolean(this.i32())],
            ['b64', () => Boolean(this.i64())],

            ['u8', () => this.u8()],
            ['u16', () => this.u16()],
            ['u32', () => this.u32()],
            ['u64', () => this.u64()],

            ['i8', () => this.i8()],
            ['i16', () => this.i16()],
            ['i32', () => this.i32()],
            ['i64', () => this.i64()],

            ['f', () => this.f()],
            ['d', () => this.d()],

            ['s', (size?: number) => this.s(size)],
            ['ws', (size?: number) => this.ws(size)],
            ['buf', (size?: number) => this.buf(size)],
            ['j', (size?: number) => this.s(size)],
        ]);
        this.addPredefinedAliases();
    }

    /** Rebind this reader to new bytes/offset so it can be reused across calls. */
    reset(bytes: Uint8Array, offset = 0) {
        this._bytes = bytes;
        this._view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        this._offset = offset;
        this._beginOffset = offset;
    }

    read(type: string, size?: number): ReaderValue {
        if (size === undefined) {
            const groups = type.match(this._stringOrBufferAtomOrJsonGroups)?.groups;
            if (groups) {
                type = groups.type;
                size = +groups.size;
            }
        }
        const reader = this._atomFunctions.get(type);
        if (!reader) {
            throw new Error(`Unknown type ${type}`);
        }
        return (reader as ReaderFunctions)(size);
    }

    get size(): number {
        return this._offset - this._beginOffset;
    }

    get offset(): number {
        return this._offset;
    }

    private move(size: number) {
        this._offset += size;
    }

    private u8(): number {
        const val = this._view.getUint8(this._offset);
        this.move(1);
        return val;
    }

    private i8(): number {
        const val = this._view.getInt8(this._offset);
        this.move(1);
        return val;
    }

    private u16(): number {
        const val = this._view.getUint16(this._offset, this._le);
        this.move(2);
        return val;
    }

    private i16(): number {
        const val = this._view.getInt16(this._offset, this._le);
        this.move(2);
        return val;
    }

    private u32(): number {
        const val = this._view.getUint32(this._offset, this._le);
        this.move(4);
        return val;
    }

    private i32(): number {
        const val = this._view.getInt32(this._offset, this._le);
        this.move(4);
        return val;
    }

    private u64(): bigint {
        const val = this._view.getBigUint64(this._offset, this._le);
        this.move(8);
        return val;
    }

    private i64(): bigint {
        const val = this._view.getBigInt64(this._offset, this._le);
        this.move(8);
        return val;
    }

    private f(): number {
        const val = this._view.getFloat32(this._offset, this._le);
        this.move(4);
        return val;
    }

    private d(): number {
        const val = this._view.getFloat64(this._offset, this._le);
        this.move(8);
        return val;
    }

    private s(size?: number): string {
        if (size === undefined || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }
        if (size === 0) {
            // size 0 — null-terminated string (terminator included in the size)
            const found = this.findZeroByte(this._offset);
            size = found === -1 ? this._bytes.length - this._offset : found - this._offset + 1;
        }
        const val = this._utf8Decoder
            .decode(this._bytes.subarray(this._offset, this._offset + size))
            .split('\0', 1).pop(); // remove all trailing null bytes
        this.move(size);
        return val;
    }

    private ws(size?: number): string {
        if (size === undefined || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }
        if (size === 0) {
            // size 0 — null-terminated wstring (terminator included in the size)
            const found = this.findZeroWord(this._offset);
            size = found === -1 ? this._bytes.length - this._offset : found - this._offset + 2;
        } else {
            size *= 2; // utf16le: 2 bytes per character
        }
        const val = this._utf16Decoder
            .decode(this._bytes.subarray(this._offset, this._offset + size))
            .split('\u0000', 1).pop(); // remove all trailing null bytes
        this.move(size);
        return val;
    }

    private buf(size?: number): ReaderValue {
        if (!size || size < 0) {
            throw new Error(`Invalid buffer size ${size ?? typeof size}`);
        }
        const val = this._bytes.slice(this._offset, this._offset + size);
        this.move(size);
        return val as unknown as ReaderValue;
    }

    private findZeroByte(from: number): number {
        for (let i = from; i < this._bytes.length; i++) {
            if (this._bytes[i] === 0) {
                return i;
            }
        }
        return -1; // no terminator — consume to the end
    }

    private findZeroWord(from: number): number {
        for (let i = from; i + 1 < this._bytes.length; i += 2) {
            if (this._bytes[i] === 0 && this._bytes[i + 1] === 0) {
                return i;
            }
        }
        return -1; // no terminator — consume to the end
    }
}
