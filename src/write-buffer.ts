import { WriterFunctions, WriterValue } from "./types";
import { BaseBuffer } from "./base-buffer";

export class WriteBuffer extends BaseBuffer {
    protected _types: string[] = [];
    protected _buffers: Buffer[] = [];
    protected _offset = 0;
    protected _atomFunctions: Map<string, WriterFunctions>;

    private _u8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(val);
        this.addAtom('u8', buffer);
    }

    private _i8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(val);
        this.addAtom('i8', buffer);
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
        this.addAtom(`s${size}`, buffer);
    }

    constructor() {
        super();
        this._atomFunctions = new Map<string, WriterFunctions>([
            ['b8', (val: boolean) => this._i8(+Boolean(val))],
            ['u8', (val: number) => this._u8(val)],
            ['i8', (val: number) => this._i8(val)],
            ['s', (val: string, size?: number) => this._s(val, size)],
        ]);
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

    protected addAtom(atom: string, buffer: Buffer) {
        this._types.push(atom);
        this._buffers.push(buffer);
        this._offset += buffer.length;
    }

    toAtoms(): string[] {
        return this._types.map((a, i) => `${a}:${this._buffers[i].toString('hex')}`);
    }

    // TODO: Remove this method
    get size2(): number {
        return this._buffers.reduce((acc, b) => acc + b.length, 0);
    }
}