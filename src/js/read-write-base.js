const { Type, SpecialType } = require("./types");

/**
 * @class
 */
class ReadWriteBase {
    constructor() {
        this._typeLengthRegex = /^(?<dynamicType>\w+)\.(?<dynamicLength>\w+)$/;
        this._stringTypes = ['s', 'string'];
        this._bufferTypes = ['buf', 'buffer'];
        this._jsonTypes = ['j', 'json', 'any'];
    }

    /**
     * @param {string} key
     * @returns {RegExpMatchArray}
     */
    _getTypeLengthGroupsMatch(key) {
        return key.match(this._typeLengthRegex)?.groups;
    }

    /**
     * @param {Type} modelType
     * @returns {SpecialType | undefined}
     */
    _getSpecialType(modelType) {
        if (this._stringTypes.includes(modelType)) {
            return SpecialType.String;
        }
        if (this._bufferTypes.includes(modelType)) {
            return SpecialType.Buffer;
        }
        if (this._jsonTypes.includes(modelType)) {
            return SpecialType.Json;
        }
    }

    /**
     * @param {string} size
     * @returns {{ isStatic: boolean, staticSize: number }}
     */
    _getStaticSize(size) {
        const value = +size;
        return {
            isStatic: !Number.isNaN(value),
            staticSize: value
        };
    }

    /**
     * @param {object | string} modelType
     * @param {string} dynamicLength
     * @returns {{ specialType: SpecialType | undefined, isStatic: boolean, staticSize: number }}
     */
    extractTypeAndSize(modelType, dynamicLength) {
        const specialType = this._getSpecialType(modelType);
        const {isStatic, staticSize} = this._getStaticSize(dynamicLength);
        return {specialType, isStatic, staticSize};
    }
}

module.exports = ReadWriteBase;