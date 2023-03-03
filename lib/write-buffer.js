import { BaseBuffer } from "./base-buffer";
export class WriteBuffer extends BaseBuffer {
    _u8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(val);
        this.addAtom('u8', buffer);
    }
    _i8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(val);
        this.addAtom('i8', buffer);
    }
    _s(val = '', size) {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }
        if (size === undefined) {
            size = val.length;
        }
        else {
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
    _buf(val = Buffer.from(""), size) {
        if (!(val instanceof Buffer)) {
            throw new Error(`Invalid buffer value ${val}`);
        }
        let buffer;
        if (size === undefined) {
            buffer = val;
            size = buffer.length;
        }
        else {
            buffer = Buffer.alloc(size);
            val.copy(buffer, 0, 0, size);
        }
        this.addAtom(`buf${size}`, buffer);
    }
    constructor() {
        super();
        this._types = [];
        this._buffers = [];
        this._offset = 0;
        this._atomFunctions = new Map([
            ['b8', (val) => this._i8(+Boolean(val))],
            ['u8', (val) => this._u8(val)],
            ['i8', (val) => this._i8(val)],
            ['s', (val, size) => this._s(val, size)],
            ['buf', (val, size) => this._buf(val, size)],
        ]);
    }
    write(type, val) {
        let size;
        const match = type.match(/^(?<type>s|buf)(?<size>\d+)$/);
        if (match) {
            type = match.groups.type;
            size = +match.groups.size;
        }
        if (this._atomFunctions.has(type)) {
            const writer = this._atomFunctions.get(type);
            writer(val, size);
        }
        else {
            throw new Error(`Unknown type ${type}`);
        }
    }
    get buffer() {
        return this.toBuffer();
    }
    toBuffer() {
        return Buffer.concat(this._buffers);
    }
    get size() {
        return this._offset;
    }
    get offset() {
        return this._offset;
    }
    addAtom(atom, buffer) {
        this._types.push(atom);
        this._buffers.push(buffer);
        this._offset += buffer.length;
    }
    toAtoms() {
        return this._types.map((a, i) => `${a}:${this._buffers[i].toString('hex')}`);
    }
    // TODO: Remove this method
    get size2() {
        return this._buffers.reduce((acc, b) => acc + b.length, 0);
    }
}
//# sourceMappingURL=write-buffer.js.map