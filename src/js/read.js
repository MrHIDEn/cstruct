const { ReadBufferBE } = require("./read-buffer-be");
const { ReadBufferLE } = require("./read-buffer-le");
const { SpecialType, StructEntry, Type } = require("./types");
const { ReadWriteBase } = require("./read-write-base");

/**
 * @class
 * @extends {ReadWriteBase}
 */
class Read extends ReadWriteBase {
    /**
     * @constructor
     */
    constructor() {
        super();
        this._struct = null;
        this._reader = null;
    }

    /**
     * @param {Object} struct
     */
    _recursion(struct) {
        const entries = Object.entries(struct);

        for (const [modelKey, modelType] of entries) {
            const keyDynamicGroups = this._getTypeLengthGroupsMatch(modelKey);

            if (keyDynamicGroups) {
                delete struct[modelKey];
                const {dynamicType, dynamicLength} = keyDynamicGroups;
                this._readDynamicOrStatic(struct, modelType, dynamicType, dynamicLength, modelType, dynamicType);
                continue;
            }

            if (typeof modelType === 'string') {
                const typeDynamicGroups = this._getTypeLengthGroupsMatch(modelType);

                if (typeDynamicGroups) {
                    const {dynamicType, dynamicLength} = typeDynamicGroups;
                    this._readDynamicOrStatic(struct, dynamicType, dynamicType, dynamicLength, dynamicType, modelKey);
                    continue;
                }
            }

            this._read(struct, modelKey, modelType);
        }
    }

    /**
     * @private
     * @param {Object} struct
     * @param {string} modelType
     * @param {string} dynamicType
     * @param {string} dynamicLength
     * @param {string} readType
     * @param {string} structKey
     */
    _readDynamicOrStatic(struct, modelType, dynamicType, dynamicLength, readType, structKey) {
        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);

        const size = isStatic
            ? staticSize
            : this._reader.read(dynamicLength);

        if (size === 0 && specialType === SpecialType.Buffer) {
            throw new Error(`Buffer size can not be 0.`);
        }

        if (specialType) {
            const value = this._reader.read(readType, size);
            struct[structKey] = specialType === SpecialType.Json ? JSON.parse(value) : value;
        } else {
            this._readArray(readType, struct, structKey, size);
        }
    }

    /**
     * @private
     * @param {Object} struct
     * @param {string} key
     * @param {Type} type
     */
    _read(struct, key, type) {
        switch (typeof type) {
            case 'object':
                this._recursion(struct[key]);
                break;
            case 'string':
                struct[key] = this._reader.read(type);
                break;
            default:
                throw TypeError(`Unknown type "${type}"`);
        }
    }

    /**
     * @private
     * @param {Type} itemsType
     * @param {Object} struct
     * @param {string} dynamicKey
     * @param {number} size
     */
    _readArray(itemsType, struct, dynamicKey, size) {
        switch (typeof itemsType) {
            case 'object': {
                const json = JSON.stringify(itemsType);
                struct[dynamicKey] = Array(size).fill(0).map(() => JSON.parse(json));
                this._recursion(struct[dynamicKey]);
                break;
            }
            case 'string':
                struct[dynamicKey] = Array(size).fill(itemsType);
                this._recursion(struct[dynamicKey]);
                break;
            default:
                throw TypeError(`Unknown type "${itemsType}"`);
        }
    }

    /**
     * @returns {Object}
     */
    toStruct() {
        return this._struct;
    }

    /**
     * @returns {number}
     */
    get size() {
        return this._reader.size;
    }

    /**
     * @returns {number}
     */
    get offset() {
        return this._reader.offset;
    }
}

module.exports = Read;