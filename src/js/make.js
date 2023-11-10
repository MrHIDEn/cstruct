const { Model, SpecialType, StructEntry, Type, WriterValue } = require("./types");
const { WriteBufferLE } = require("./write-buffer-le");
const { WriteBufferBE } = require("./write-buffer-be");
const { ReadWriteBase } = require("./read-write-base");

/**
 * @class
 * @extends {ReadWriteBase}
 */
class Make extends ReadWriteBase {
    /**
     * @constructor
     */
    constructor() {
        super();
        this._writer = null;
    }

    /**
     * @param {Model} model
     * @param {any} struct
     */
    _recursion(model, struct) {
        const entries = Object.entries(model);

        for (const [modelKey, modelType] of entries) {
            const keyLengthGroups = this._getTypeLengthGroupsMatch(modelKey);

            if (keyLengthGroups) {
                const {dynamicType, dynamicLength} = keyLengthGroups;
                this._writDynamicOrStatic(struct, modelType, dynamicLength, dynamicType, modelType);
                continue;
            }

            if (typeof modelType === 'string') {
                const typeDynamicGroups = this._getTypeLengthGroupsMatch(modelType);

                if (typeDynamicGroups) {
                    const {dynamicType, dynamicLength} = typeDynamicGroups;
                    this._writDynamicOrStatic(struct, dynamicType, dynamicLength, modelKey, dynamicType);
                    continue;
                }
            }

            this._write(model, struct, modelKey, modelType);
        }
    }

    /**
     * @param {any} struct
     * @param {string} modelType
     * @param {string} dynamicLength
     * @param {string} structKey
     * @param {string} writeType
     */
    _writDynamicOrStatic(struct, modelType, dynamicLength, structKey, writeType) {
        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);

        let structValues = struct[structKey];
        if (specialType === SpecialType.Json) {
            structValues = JSON.stringify(structValues);
        }

        if (isStatic && staticSize !== 0 && structValues.length > staticSize  && specialType !== SpecialType.String) {
            throw new Error(`Size of value ${structValues.length} is greater than ${staticSize}.`);
        }

        const size = isStatic
            ? staticSize
            : structValues.length;

        if (size === 0 && specialType === SpecialType.Buffer) {
            throw new Error(`Buffer size can not be 0.`);
        }

        if (!isStatic) {
            this._writer.write(dynamicLength, size);
        }

        if (specialType) {
            this._writer.write(writeType, structValues, isStatic ? size : undefined);
        } else {
            this._writeArray(writeType, structValues);
        }
    }

    /**
     * @param {Model} model
     * @param {any} struct
     * @param {string} modelKey
     * @param {Type} modelType
     */
    _write(model, struct, modelKey, modelType) {
        switch (typeof modelType) {
            case 'object':
                this._recursion(model[modelKey], struct[modelKey]);
                break;
            case 'string':
                this._writer.write(modelType, struct[modelKey]);
                break;
            default:
                throw TypeError(`Unknown type "${modelType}"`);
        }
    }

    /**
     * @param {Type} itemsType
     * @param {any[]} structValues
     */
    _writeArray(itemsType, structValues) {
        switch (typeof itemsType) {
            case 'object':
                for (const structValue of structValues) {
                    this._recursion(itemsType, structValue);
                }
                break;
            case 'string':
                for (const structValue of structValues) {
                    this._writer.write(itemsType, structValue);
                }
                break;
            default:
                throw TypeError(`Unknown type "${itemsType}"`);
        }
    }

    /**
     * @returns {Buffer}
     */
    toBuffer() {
        return this._writer.toBuffer();
    }

    /**
     * @returns {number}
     */
    get offset() {
        return this._writer.size;
    }

    /**
     * @returns {number}
     */
    get size() {
        return this._writer.size;
    }

    /**
     * @returns {[Buffer, number]}
     */
    getBufferAndOffset() {
        return [this.toBuffer(), this.offset];
    }
}

module.exports = Make;