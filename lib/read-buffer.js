import { BaseBuffer } from "./base-buffer";
export class ReadBuffer extends BaseBuffer {
    _u8() {
        const val = this._buffer.readUInt8(this._offset);
        this.addAtom('u8', 1);
        return val;
    }
    _i8() {
        const val = this._buffer.readInt8(this._offset);
        this.addAtom('i8', 1);
        return val;
    }
    _s(size) {
        if (!size || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }
        // Consider using "utf16le" encoding as well as "utf8" encoding
        const val = this._buffer
            .toString('utf8', this._offset, this._offset + size)
            .replace(/\0+$/, "");
        this.addAtom(`s${size}`, size);
        return val;
    }
    _buf(size) {
        if (!size || size < 0) {
            throw new Error(`Invalid buffer size ${size ?? typeof size}`);
        }
        const val = this._buffer
            .slice(this._offset, this._offset + size);
        this.addAtom(`s${size}`, size);
        return val;
    }
    constructor(buffer, offset = 0) {
        super();
        this._types = [];
        this._buffers = [];
        this._buffer = buffer;
        this._offset = offset;
        this._beginOffset = offset;
        this._atomFunctions = new Map([
            ['b8', () => Boolean(this._i8())],
            ['u8', () => this._u8()],
            ['i8', () => this._i8()],
            ['s', (size) => this._s(size)],
            ['buf', (size) => this._buf(size)],
        ]);
    }
    read(type) {
        let size;
        const match = type.match(/^(?<type>s|buf)(?<size>\d+)$/);
        if (match) {
            type = match.groups.type;
            size = +match.groups.size;
        }
        if (this._atomFunctions.has(type)) {
            const reader = this._atomFunctions.get(type);
            return reader(size);
        }
        else {
            throw new Error(`Unknown type ${type}`);
        }
    }
    get size() {
        return this._offset - this._beginOffset;
    }
    get offset() {
        return this._offset;
    }
    addAtom(type, size) {
        const buffer = this._buffer.slice(this._offset, this._offset + size);
        this._types.push(type);
        this._buffers.push(buffer);
        this._offset += buffer.length;
    }
    toAtoms() {
        return this._types.map((a, i) => `${a}:${this._buffers[i].toString('hex')}`);
    }
}
//# sourceMappingURL=read-buffer.js.map