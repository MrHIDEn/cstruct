const { Model, Types } = require("./types");
const { ModelParser } = require("./model-parser");

/**
 * CStruct class
 * @class
 */
class CStruct {
    /**
     * CStruct constructor
     * @param {Model} model - The model to use
     * @param {Types} types - The types to use
     */
    constructor(model, types) {
        this._jsonTypes = types;
        this._jsonModel = ModelParser.parseModel(model, types);
    }

    /**
     * Get jsonTypes
     * @returns {string} - The jsonTypes
     */
    get jsonTypes() {
        return this._jsonTypes ? ModelParser.parseModel(this._jsonTypes) : undefined;
    }

    /**
     * Get jsonModel
     * @returns {string} - The jsonModel
     */
    get jsonModel() {
        return this._jsonModel;
    }

    /**
     * Get modelClone
     * @returns {Model} - The modelClone
     */
    get modelClone() {
        return JSON.parse(this._jsonModel);
    }

    /**
     * Read from a buffer
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The offset to start at
     * @throws {Error} - If the method is not implemented
     */
    read(buffer, offset = 0) {
        throw Error("This is abstract class");
    }

    /**
     * Write to a buffer
     * @param {Buffer} buffer - The buffer to write to
     * @param {any} struct - The struct to use
     * @param {number} offset - The offset to start at
     * @throws {Error} - If the method is not implemented
     */
    write(buffer, struct, offset = 0) {
        throw Error("This is abstract class");
    }

    /**
     * Make a struct
     * @param {any} struct - The struct to use
     * @throws {Error} - If the method is not implemented
     */
    make(struct) {
        throw Error("This is abstract class");
    }
}

module.exports = CStruct;