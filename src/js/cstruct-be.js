const { CStruct } = require("./cstruct");
const { CStructReadResult, CStructWriteResult, Model, Types } = require("./types");
const { MakeBE } = require("./make-be");
const { WriteBE } = require("./write-be");
const { ReadBE } = require("./read-be");
const { CStructMetadata } = require("./decorators-metadata");
const { Class, CStructClassOptions } = require("./decorators-types");

/**
 * C_Struct BE - Big Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 * @class
 */
class CStructBE extends CStruct {
    /**
     * CStructBE constructor
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
        const writer = new MakeBE(this.modelClone, struct);
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
        const writer = new WriteBE(this.modelClone, struct, buffer, offset);
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
        const reader = new ReadBE(this.modelClone, buffer, offset);
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
        const cStruct = CStructMetadata.getCStructBE(struct);
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
        const cStruct = CStructMetadata.getCStructBE(struct);
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
        const cStruct = CStructMetadata.getCStructBE(instance);
        const result = cStruct.read(buffer, offset);
        result.struct = Object.assign(instance, result.struct);
        return result;
    }

    /**
     * Get a CStructBE from a class or CStructClassOptions
     * @param {Class | CStructClassOptions | any} from - The class or CStructClassOptions to use
     * @returns {CStructBE} - The CStructBE
     */
    static from(from) {
        return CStructMetadata.getCStructBE(from);
    }

    /**
     * Get a CStructBE from a model and types
     * @param {Model} model - The model to use
     * @param {Types} types - The types to use
     * @returns {CStructBE} - The CStructBE
     */
    static fromModelTypes(model, types) {
        return new CStructBE(model, types);
    }
}

module.exports = CStructBE;