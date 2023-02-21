export class WriteBuffer {
    constructor() {
        this._types = [];
        this._buffers = [];
        this._offset = 0;
        this._writers = new Map([
            ['b', (val) => this._u8(+Boolean(val))],
            ['u8', (val) => this._u8(val)],
            ['i8', (val) => this._i8(val)],
            ['s', (val, size) => this._s(val, size)],
        ]);
    }
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
    addAlias(alias, type) {
        if (this._writers.has(type)) {
            throw new Error(`Type ${type} already exists`);
        }
        const reader = this._writers.get(type);
        this._writers.set(alias, reader);
    }
    write(type, val) {
        let size;
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
    get size2() {
        return this._buffers.reduce((acc, b) => acc + b.length, 0);
    }
}
//# sourceMappingURL=write-buffer.js.map