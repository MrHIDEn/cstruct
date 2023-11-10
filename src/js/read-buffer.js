const { ReaderFunctions, ReaderValue } = require("./types");
const { BaseBuffer } = require("./base-buffer");

/**
 * @class
 * @extends {BaseBuffer}
 */
class ReadBuffer extends BaseBuffer {
    /**
     * @constructor
     * @param {Buffer} buffer
     * @param {number} offset
     */
    constructor(buffer, offset = 0) {
        super();
        this._buffer = buffer;
        this._offset = offset;
        this._beginOffset = offset;

        this._atomFunctions = new Map([
            ['b8', () => Boolean(this._i8())],
            ['u8', () => this._u8()],
            ['i8', () => this._i8()],
            ['s', (size) => this._s(size)],
            ['buf', (size) => this._buf(size)],
            ['j', (size) => this._s(size)]
        ]);
    }

    /**
     * @returns {number}
     */
    _u8() {
        const val = this._buffer.readUInt8(this._offset);
        this.moveOffset(1);
        return val;
    }

    /**
     * @returns {number}
     */
    _i8() {
        const val = this._buffer.readInt8(this._offset);
        this.moveOffset(1);
        return val;
    }

    /**
     * @param {number} size
     * @returns {string}
     */
    _s(size) {
        const val = this._buffer.toString('utf8', this._offset, this._offset + size);
        this.moveOffset(size);
        return val;
    }

    /**
     * @param {number} size
     * @returns {Buffer}
     */
    _buf(size) {
        const val = this._buffer.slice(this._offset, this._offset + size);
        this.moveOffset(size);
        return val;
    }

    /**
     * @param {string} type
     * @param {number} size
     * @returns {any}
     */
    read(type, size) {
        if (size === undefined) {
            const groups = type.match(this._stringOrBufferAtomOrJsonGroups)?.groups;
            if (groups) {
                type = groups.type;
                size = +groups.size;
            }
        }
        if (this._atomFunctions.has(type)) {
            const reader = this._atomFunctions.get(type);
            return reader(size);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    }
    /**
     * @returns {number}
     */
    get size() {
        return this._offset - this._beginOffset;
    }

    /**
     * @returns {number}
     */
    get offset() {
        return this._offset;
    }

    /**
     * @param {number} size
     */
    moveOffset(size) {
        this._offset += size;
    }
}

module.exports = ReadBuffer;