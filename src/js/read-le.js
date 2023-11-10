const { Model } = require("./types");
const { Read } = require("./read");
const { ReadBufferLE } = require("./read-buffer-le");

/**
 * @class
 * @extends {Read}
 */
class ReadLE extends Read {
    /**
     * @constructor
     * @param {Model} model
     * @param {Buffer} buffer
     * @param {number} offset
     */
    constructor(model, buffer, offset = 0) {
        super();
        this._reader = new ReadBufferLE(buffer, offset);
        this._struct = model;
        this._recursion(this._struct);
    }
}

module.exports = ReadLE;