export class WriteBuffer {
    constructor() {
        this._buffers = [];
        this._offset = 0;
        this._writers = new Map([
            ['u8', (val = 0) => this._u8(val)],
            ['i8', (val = 0) => this._i8(val)],
            ['s', (val = '', type) => this._s(val, type)],
            ['str', (val = '') => this._str(val)],
        ]);
    }
    _u8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(val);
        this._buffers.push(buffer);
        this._offset += 1;
    }
    _i8(val = 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(val);
        this._buffers.push(buffer);
        this._offset += 1;
    }
    _s(val = '', type) {
        const size = +type.slice(1);
        if (size < 1) {
            throw new Error(`Invalid string size ${size}`);
        }
        const buffer = Buffer.allocUnsafe(size);
        buffer.write(val.padEnd(size, '\0'), 0, size);
        this._buffers.push(buffer);
        this._offset += size;
    }
    _str(val = '') {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }
        const length = val.length;
        const buffer = Buffer.allocUnsafe(length);
        buffer.write(val, 0, length);
        this._buffers.push(buffer);
        this._offset += length;
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
    get size2() {
        return this._buffers.reduce((acc, b) => acc + b.length, 0);
    }
    write(type, val) {
        if (this._writers.has(type)) {
            this._writers.get(type)(val, type);
        }
        else if (type[0] === 's' && this._writers.has('s')) {
            this._writers.get('s')(val, type);
        }
        else {
            throw new Error(`Unknown type ${type}`);
        }
    }
}
//# sourceMappingURL=write-buffer.js.map