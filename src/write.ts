import { Make } from "./make";

/**
 * Write encoded bytes into a pre-allocated buffer at a given offset.
 * Encoding logic lives in Make (via recursion); this class only copies the result.
 */
export class Write<T> extends Make<T> {
    _buffer: Buffer;
    _offset: number;

    constructor(buffer: Buffer, offset = 0) {
        super();
        this._buffer = buffer;
        this._offset = offset;
    }

    // Encode struct into an internal buffer, then copy into the target buffer at _offset
    toBuffer() {
        const makeBuffer = this._writer.toBuffer();
        const leftSpace = this._buffer.length - this._offset;
        if (leftSpace < this.size) {
            throw Error(`Write buffer is too short. Needs ${this.size - leftSpace} byte/s more.`)
        }
        makeBuffer.copy(this._buffer, this._offset);
        return this._buffer;
    }

    // Cursor position after the write (start offset + bytes written)
    get offset() {
        return this._offset + this.size;
    }
}