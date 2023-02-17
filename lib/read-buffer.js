export class ReadBuffer {
    constructor(buffer, offset = 0) {
        // (undefined | type | size) => any
        this._readers = new Map([
            ['u8', () => this._u8()],
            ['i8', () => this._i8()],
            ['s', (type) => this._s(type)],
            ['str', (size) => this._str(size)],
        ]);
        this._buffer = buffer;
        this._offset = offset;
        this._beginOffset = offset;
    }
    _u8() {
        const val = this._buffer.readUInt8(this._offset);
        this._offset += 1;
        return val;
    }
    _i8() {
        const val = this._buffer.readInt8(this._offset);
        this._offset += 1;
        return val;
    }
    _s(type) {
        const size = +type.slice(1);
        if (size < 1) {
            throw new Error(`Invalid string size ${size}`);
        }
        const val = this._buffer.toString('utf8', this._offset, this._offset + size);
        this._offset += size;
        return val;
    }
    _str(size) {
        if (size < 0) {
            throw new Error(`Invalid string size ${size}`);
        }
        const val = this._buffer.toString('utf8', this._offset, this._offset + size);
        this._offset += size;
        return val;
    }
    read(type, size) {
        if (this._readers.has(type)) {
            return this._readers.get(type)(size);
        }
        else if (type[0] === 's' && this._readers.has('s')) {
            return this._readers.get('s')(type);
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
}
//# sourceMappingURL=read-buffer.js.map