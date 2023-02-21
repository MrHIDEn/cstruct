import { ReaderFunctions, ReaderValue } from "./types";

export class ReadBuffer {
    protected _types: string[] = [];
    protected _buffers: Buffer[] = [];
    protected _buffer: Buffer;
    protected _offset: number;
    protected _beginOffset: number;

    protected _readers = new Map<string, ReaderFunctions>([
        ['b', () => Boolean(this._u8())],
        ['u8', () => this._u8()],
        ['i8', () => this._i8()],
        ['s', (size: number) => this._s(size)],
    ]);

    constructor(buffer: Buffer, offset = 0) {
        this._buffer = buffer;
        this._offset = offset;
        this._beginOffset = offset;
    }

    private _u8() {
        const val = this._buffer.readUInt8(this._offset);
        this.addAtom('u8', 1);
        return val;
    }

    private _i8() {
        const val = this._buffer.readInt8(this._offset);
        this.addAtom('i8', 1);
        return val;
    }

    private _s(size: number) {
        if (!size || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }

        // Consider using "utf16le" encoding as well as "utf8" encoding
        const val = this._buffer
            .toString('utf8', this._offset, this._offset + size)
            .replace(/\0+$/,"");
        this.addAtom(`s${size}`, size);
        return val;
    }

    addAlias(alias: string, type: string) {
        if (this._readers.has(type)) {
            throw new Error(`Type ${type} already exists`);
        }
        const reader = this._readers.get(type);
        this._readers.set(alias, reader);
    }

    read(type: string): ReaderValue {
        let size: number;
        if (type[0] === 's') {
            const match = type.match(/^s(\d+)$/);
            if (match) {
                type = 's';
                size = +match[1];
            }
        }
        if (this._readers.has(type)) {
            const reader = this._readers.get(type);
            return reader(size);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    }

    get size() {
        return this._offset - this._beginOffset;
    }

    get offset() {
        return this._offset;
    }

    protected addAtom(type: string, size: number) {
        const buffer: Buffer = this._buffer.slice(this._offset, this._offset + size);
        this._types.push(type);
        this._buffers.push(buffer);
        this._offset += buffer.length;
    }

    toAtoms(): string[] {
        return this._types.map((a, i) => `${a}:${this._buffers[i].toString('hex')}`);
    }
}

function f(type) {
    const match = type.match(/^s(\d+)$/);
    if (match) {
        const [, sSize] = match;
        sSize;//?
        return sSize;
    }
}