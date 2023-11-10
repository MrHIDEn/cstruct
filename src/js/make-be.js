const { Model } = require("./types");
const { WriteBufferBE } = require("./write-buffer-be");
const { Make } = require("./make");

/**
 * @class
 * @extends {Make}
 */
class MakeBE extends Make {
    /**
     * @constructor
     * @param {Model} model - The model to use
     * @param {any} struct - The struct to use
     */
    constructor(model, struct) {
        super();
        this._writer = new WriteBufferBE();
        this._recursion(model, struct);
    }
}

module.exports = MakeBE;