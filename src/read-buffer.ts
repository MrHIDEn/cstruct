import { ReaderFunctions, ReaderValue } from "./types";

export class ReadBuffer {
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
        this._offset += 1;
        return val;
    }

    private _i8() {
        const val = this._buffer.readInt8(this._offset);
        this._offset += 1;
        return val;
    }

    private _s(size: number) {
        if (!size || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }
        const val = this._buffer.toString('utf8', this._offset, this._offset + size);
        this._offset += size;
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
}

function f(type) {
    const match = type.match(/^s(\d+)$/);
    if (match) {
        const [, sSize] = match;
        sSize;//?
        return sSize;
    }
}

f('s1');//?
f('s2');//?
f('s');//?
f('sa');//?
f('s1a');//?