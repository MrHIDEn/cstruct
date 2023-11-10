/**
 * @typedef {(number | string | bigint | boolean | Buffer)} WriterValue
 * @typedef {(number | string | bigint | boolean | Buffer)} ReaderValue
 * @typedef {(number | string | bigint | boolean | Buffer)} ModelValue
 * @typedef {(val: WriterValue, size?: number) => void} WriterFunctions
 * @typedef {(size?: number) => ReaderValue} ReaderFunctions
 * @typedef {(object | ModelValue[] | string)} Model
 * @typedef {(object | string)} Types
 * @typedef {(object | string)} Type
 * @typedef {([key: string, type: Type])} StructEntry
 * @typedef {(string[])} Alias
 */

/**
 * @typedef {Object} CStructReadResult
 * @property {T} struct
 * @property {number} offset
 * @property {number} size
 */

/**
 * @typedef {Object} CStructWriteResult
 * @property {Buffer} buffer
 * @property {number} offset
 * @property {number} size
 */

/**
 * @enum {number}
 */
const SpecialType = {
    String: 1,
    Buffer: 2,
    Json: 3,
};

module.exports = {
    WriterValue,
    ReaderValue,
    ModelValue,
    WriterFunctions,
    ReaderFunctions,
    Model,
    Types,
    Type,
    StructEntry,
    Alias,
    CStructReadResult,
    CStructWriteResult,
    SpecialType,
};