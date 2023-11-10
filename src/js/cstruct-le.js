const { CStruct } = require("./cstruct");
const { CStructReadResult, CStructWriteResult, Model, Types } = require("./types");
const { MakeLE } = require("./make-le");
const { WriteLE } = require("./write-le");
const { ReadLE } = require("./read-le");
const { CStructMetadata } = require("./decorators-metadata");
const { Class, CStructClassOptions } = require("./decorators-types");

/**
 * C_Struct LE - Little Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 * @class
 */
class CStructLE extends CStruct {
    /**
     * CStructLE constructor
     * @param {Model} model - The model to use
     * @param {Types} types - The types to use
     */
    constructor(model, types) {
        super(model, types);
    }

    /**
     * Make a CStructWriteResult
     * @param {any} struct - The struct to use
     * @returns {CStructWriteResult} - The result
     */
    make(struct) {
        const writer = new MakeLE(this.modelClone, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size
        }
    }

    /**
     * Write a CStructWriteResult
     * @param {Buffer} buffer - The buffer to write to
     * @param {any} struct - The struct to use
     * @param {number} offset - The offset to start at
     * @returns {CStructWriteResult} - The result
     */
    write(buffer, struct, offset = 0) {
        const writer = new WriteLE(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size
        }
    }

    /**
     * Read a CStructReadResult
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The offset to start at
     * @returns {CStructReadResult} - The result
     */
    read(buffer, offset = 0) {
        const reader = new ReadLE(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct(),
            offset: reader.offset,
            size: reader.size
        };
    }

    /**
     * Make a CStructWriteResult
     * @param {any} struct - The struct to use
     * @returns {CStructWriteResult} - The result
     */
    static make(struct) {
        const cStruct = CStructMetadata.getCStructLE(struct);
        return cStruct.make(struct);
    }

    /**
     * Write a CStructWriteResult
     * @param {any} struct - The struct to use
     * @param {Buffer} buffer - The buffer to write to
     * @param {number} offset - The offset to start at
     * @returns {CStructWriteResult} - The result
     */
    static write(struct, buffer, offset) {
        const cStruct = CStructMetadata.getCStructLE(struct);
        return cStruct.write(buffer, struct, offset);
    }

    /**
     * Read a CStructReadResult
     * @param {Class} TClass - The class to use
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The offset to start at
     * @returns {CStructReadResult} - The result
     */
    static read(TClass, buffer, offset) {
        const instance = new TClass();
        const cStruct = CStructMetadata.getCStructLE(instance);
        const result = cStruct.read(buffer, offset);
        result.struct = Object.assign(instance, result.struct);
        return result;
    }

    /**
     * Get a CStructLE from a class or CStructClassOptions
     * @param {Class | CStructClassOptions | any} from - The class or CStructClassOptions to use
     * @returns {CStructLE} - The CStructLE
     */
    static from(from) {
        return CStructMetadata.getCStructLE(from);
    }

    /**
     * Get a CStructLE from a model and types
     * @param {Model} model - The model to use
     * @param {Types} types - The types to use
     * @returns {CStructLE} - The CStructLE
     */
    static fromModelTypes(model, types) {
        return new CStructLE(model, types);
    }
}

module.exports = CStructLE;