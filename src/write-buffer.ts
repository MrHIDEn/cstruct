import { WriterFunctions, WriterValue } from "./types";

export class WriteBuffer {
    protected _buffers: Buffer[] = [];
    protected _offset = 0;

    protected _writers = new Map<string, WriterFunctions>([
        ['b', (val: boolean) => this._u8(+Boolean(val))],
        ['u8', (val: number) => this._u8(val)],
        ['i8', (val: number) => this._i8(val)],
        ['s', (val: string, size?: number) => this._s(val, size)],
    ]);

    private _u8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(val);
        this._buffers.push(buffer);
        this._offset += 1;
    }

    private _i8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(val);
        this._buffers.push(buffer);
        this._offset += 1;
    }

    private _s(val = '', size?: number) {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }

        let buffer: Buffer;
        if (size === undefined) {
            size = val.length;
            buffer = Buffer.allocUnsafe(size);
            buffer.write(val, 0, size);
        } else {
            if (size < 0) {
                throw new Error(`Invalid string size ${size}`);
            }
            buffer = Buffer.allocUnsafe(size);
            buffer.write(val.padEnd(size, '\0'), 0, size);
        }

        this._buffers.push(buffer);
        this._offset += size;
    }

    addAlias(alias: string, type: string) {
        if (this._writers.has(type)) {
            throw new Error(`Type ${type} already exists`);
        }
        const reader = this._writers.get(type);
        this._writers.set(alias, reader);
    }

    write(type: string, val: WriterValue) {
        let size: number;
        if (type[0] === 's') {
            const match = type.match(/^s(\d+)$/);
            if (match) {
                type = 's';
                size = +match[1];
            }
        }
        if (this._writers.has(type)) {
            const writer = this._writers.get(type);
            writer(val, size);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    }

    get buffer(): Buffer {
        return this.toBuffer();
    }

    toBuffer(): Buffer {
        return Buffer.concat(this._buffers);
    }

    get size(): number {
        return this._offset;
    }

    get size2(): number {
        return this._buffers.reduce((acc, b) => acc + b.length, 0);
    }
}