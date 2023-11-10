const { Model } = require("./types");
const { WriteBufferLE } = require("./write-buffer-le");
const { Make } = require("./make");

/**
 * @class
 * @extends {Make}
 */
class MakeLE extends Make {
    /**
     * @constructor
     * @param {Model} model - The model to use
     * @param {any} struct - The struct to use
     */
    constructor(model, struct) {
        super();
        this._writer = new WriteBufferLE();
        this._recursion(model, struct);
    }
}

module.exports = MakeLE;