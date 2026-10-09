import { WriterFunctions, WriterValue } from "./types";
import { BaseBuffer } from "./base-buffer";

export abstract class WriteBuffer extends BaseBuffer {
    protected _buffer: Buffer;
    protected _offset = 0;
    protected _atomFunctions: Map<string, WriterFunctions>;

    // Multi-byte atoms are implemented in WriteBufferLE / WriteBufferBE.
    protected abstract u16(val?: number): void;
    protected abstract i16(val?: number): void;
    protected abstract u32(val?: number): void;
    protected abstract i32(val?: number): void;
    protected abstract u64(val?: bigint): void;
    protected abstract i64(val?: bigint): void;
    protected abstract f(val?: number): void;
    protected abstract d(val?: number): void;

    /** Ensure the single backing buffer can hold `n` more bytes, growing if needed. */
    protected ensure(n: number) {
        if (this._offset + n > this._buffer.length) {
            const bigger = Buffer.allocUnsafe(Math.max(this._buffer.length * 2, this._offset + n));
            this._buffer.copy(bigger, 0, 0, this._offset);
            this._buffer = bigger;
        }
    }

    private u8(val = 0) {
        this.ensure(1);
        this._buffer.writeUInt8(val, this._offset);
        this._offset += 1;
    }

    private i8(val = 0) {
        this.ensure(1);
        this._buffer.writeInt8(val, this._offset);
        this._offset += 1;
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
        this._buffer.fill(0, this._offset, this._offset + size);
        this._buffer.write(val, this._offset, size, 'utf8');
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

        size *= 2; // utf16le 2 bytes per character

        this.ensure(size);
        this._buffer.fill(0, this._offset, this._offset + size);
        this._buffer.write(val, this._offset, size, 'utf16le');
        this._offset += size;
    }

    private buf(val: Buffer = Buffer.alloc(0) as Buffer, size?: number) {
        if (!(val instanceof Buffer)) {
            throw new Error(`Invalid buffer value ${val}`);
        }

        if (size === undefined) {
            this.ensure(val.length);
            val.copy(this._buffer, this._offset);
            this._offset += val.length;
        } else {
            this.ensure(size);
            this._buffer.fill(0, this._offset, this._offset + size);
            val.copy(this._buffer, this._offset, 0, size);
            this._offset += size;
        }
    }

    constructor() {
        super();
        this._buffer = Buffer.allocUnsafe(64);
        this._atomFunctions = new Map<string, WriterFunctions>([
            ['b8', (val: boolean) => this.i8(+Boolean(val))],
            ['u8', (val: number) => this.u8(val)],
            ['i8', (val: number) => this.i8(val)],
            ['s', (val: string, size?: number) => this.s(val, size)],
            ['ws', (val: string, size?: number) => this.ws(val, size)],
            ['buf', (val: Buffer, size?: number) => this.buf(val, size)],
            ['j', (val: any, size?: number) => this.s(val, size)],
        ]);
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
            case 'u64': this.u64(val as bigint); return;
            case 'i64': this.i64(val as bigint); return;
            case 'f': this.f(val as number); return;
            case 'd': this.d(val as number); return;
            case 'b16': this.i16(+Boolean(val)); return;
            case 'b32': this.i32(+Boolean(val)); return;
            case 'b64': this.i64(BigInt(+Boolean(val))); return;
            case 's': this.s(val as string, size); return;
            case 'ws': this.ws(val as string, size); return;
            case 'buf': this.buf(val as Buffer, size); return;
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
                if (writer) {
                    writer(val, size);
                    return;
                }
                throw new Error(`Unknown type ${type}`);
            }
        }
    }

    get buffer(): Buffer {
        return this.toBuffer();
    }

    toBuffer(): Buffer {
        return Buffer.from(this._buffer.subarray(0, this._offset));
    }

    get size(): number {
        return this._offset;
    }

    get offset() {
        return this._offset;
    }
}
