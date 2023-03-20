import { WriterFunctions, WriterValue } from "./types";
import { BaseBuffer } from "./base-buffer";

export class WriteBuffer extends BaseBuffer {
    protected _buffers: Buffer[] = [];
    protected _offset = 0;
    protected _atomFunctions: Map<string, WriterFunctions>;

    private _u8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(val);
        this.moveOffset(buffer);
    }

    private _i8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(val);
        this.moveOffset(buffer);
    }

    private _s(val = '', size?: number) {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }

        if (size === undefined) {
            size = val.length;
        } else {
            if (size < 0) {
                throw new Error(`Invalid string size ${size}`);
            }
            val = val.padEnd(size, '\0');
        }

        // Consider using "utf16le" encoding as well as "utf8" encoding
        const buffer = Buffer.allocUnsafe(size);
        buffer.write(val, 0, size, 'utf8');
        this.moveOffset(buffer);
    }

    private _buf(val = Buffer.alloc(0), size?: number) {
        if (!(val instanceof Buffer)) {
            throw new Error(`Invalid buffer value ${val}`);
        }

        let buffer;
        if (size === undefined) {
            buffer = val;
        } else {
            buffer = Buffer.alloc(size);
            val.copy(buffer, 0, 0, size);
        }

        this.moveOffset(buffer);
    }

    constructor() {
        super();
        this._atomFunctions = new Map<string, WriterFunctions>([
            ['b8', (val: boolean) => this._i8(+Boolean(val))],
            ['u8', (val: number) => this._u8(val)],
            ['i8', (val: number) => this._i8(val)],
            ['s', (val: string, size?: number) => this._s(val, size)],
            ['buf', (val: Buffer, size?: number) => this._buf(val, size)],
        ]);
    }

    write(type: string, val: WriterValue) {
        let size: number;
        const groups = type.match(/^(?<type>s|buf)(?<size>\d+)$/)?.groups;
        if (groups) {
            type = groups.type;
            size = +groups.size;
        }
        if (this._atomFunctions.has(type)) {
            const writer = this._atomFunctions.get(type);
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

    get offset() {
        return this._offset;
    }

    protected moveOffset(buffer: Buffer) {
        this._buffers.push(buffer);
        this._offset += buffer.length;
    }
}