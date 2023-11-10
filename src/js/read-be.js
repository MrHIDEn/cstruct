const { Model } = require("./types");
const { Read } = require("./read");
const { ReadBufferBE } = require("./read-buffer-be");

/**
 * @class
 * @extends {Read}
 */
class ReadBE extends Read {
    /**
     * @constructor
     * @param {Model} model
     * @param {Buffer} buffer
     * @param {number} offset
     */
    constructor(model, buffer, offset = 0) {
        super();
        this._reader = new ReadBufferBE(buffer, offset);
        this._struct = model;
        this._recursion(this._struct);
    }
}

module.exports = ReadBE;