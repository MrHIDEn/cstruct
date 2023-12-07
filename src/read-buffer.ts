import { ReaderFunctions, ReaderValue } from "./types";
import { BaseBuffer } from "./base-buffer";

export class ReadBuffer extends BaseBuffer {
    protected _buffer: Buffer;
    protected _offset: number;
    protected _beginOffset: number;
    protected _atomFunctions: Map<string, ReaderFunctions>;

    private u8() {
        const val = this._buffer.readUInt8(this._offset);
        this.moveOffset(1);
        return val;
    }

    private i8() {
        const val = this._buffer.readInt8(this._offset);
        this.moveOffset(1);
        return val;
    }

    private s(size: number) {
        if (size === undefined || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }
        if (size === 0) {
            size = this._buffer.indexOf(0, this._offset) - this._offset + 1;
        }

        // Consider using "utf16le" encoding as well as "utf8" encoding
        const val = this._buffer
            .toString('utf8', this._offset, this._offset + size)
            .split('\x00', 1).pop(); // remove all trailing null bytes
        this.moveOffset(size);
        return val;
    }

    private buf(size: number) {
        if (!size || size < 0) {
            throw new Error(`Invalid buffer size ${size ?? typeof size}`);
        }

        const val = this._buffer
            .slice(this._offset, this._offset + size);
        this.moveOffset(size);
        return val;
    }

    constructor(buffer: Buffer, offset = 0) {
        super();
        this._buffer = buffer;
        this._offset = offset;
        this._beginOffset = offset;

        this._atomFunctions = new Map<string, ReaderFunctions>([
            ['b8', () => Boolean(this.i8())],
            ['u8', () => this.u8()],
            ['i8', () => this.i8()],
            ['s', (size: number) => this.s(size)],
            ['buf', (size: number) => this.buf(size)],
            ['j', (size: number) => this.s(size)]
        ])
    }

    read(type: string, size?: number): ReaderValue {
        if (size === undefined) {
            const groups = type.match(this._stringOrBufferAtomOrJsonGroups)?.groups;
            if (groups) {
                type = groups.type;
                size = +groups.size;
            }
        }
        if (this._atomFunctions.has(type)) {
            const reader = this._atomFunctions.get(type);
            return reader(size);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    }

    get size(): number {
        return this._offset - this._beginOffset;
    }

    get offset(): number {
        return this._offset;
    }

    protected moveOffset(size: number) {
        this._offset += size;
    }
}