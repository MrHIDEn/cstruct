// 'c_struct' - written by marekkrzyzowski 31.01.2019 0.6.0
'use strict';

let PRE_ALLOC_SIZE = 200;
module.exports.PRE_ALLOC_SIZE = PRE_ALLOC_SIZE;

/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {Object} uTypes*/
/**@param {Boolean} protect*/
/**@returns {(Object, Array)}*/ //processed struct
function parseStruct(struct, uTypes = {}, { protect = false } = {}) {
    let result = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    function baseSize(type) {
        return {
            u8: 1, u16: 2, u32: 4,
            i8: 1, i16: 2, i32: 4,
            f: 4, d: 8
        }[type] || type[0] == 's' && +type.slice(1);
    }
    function recursion(struct) {
        let entries = Object.entries(struct);
        for (let [key, type] of entries) {
            switch (typeof type) {
                case 'object': recursion(struct[key]); break;
                case 'string':
                    let s = baseSize(type);
                    if (s !== false) { break; }
                    if (uTypes[type]) {
                        recursion(struct[key] = Object.assign((Array.isArray(uTypes[type]) ? [] : {}), uTypes[type]), key);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default:
                    throw TypeError(`Unsupported type '${typeof type}' for "${key}:${type}`);
            }
        }
    }
    recursion(result);
    return result;
}
module.exports.parseStruct = parseStruct;

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} struct*/ // struct $= {}, []
/**@param {Object} uTypes*/
/**@returns {Array.<object, number>}*/ //[readObject, offset]
function readBufferLE(buffer, struct, { protect = false, offset = 0 } = {}) {
    let object = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    const readers = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16LE((offset += 2) - 2); },
        u32() { return buffer.readUInt32LE((offset += 4) - 4); },
        i8() { return buffer.readInt8((offset += 1) - 1); },
        i16() { return buffer.readInt16LE((offset += 2) - 2); },
        i32() { return buffer.readInt32LE((offset += 4) - 4); },
        f() { return buffer.readFloatLE((offset += 4) - 4); },
        d() { return buffer.readDoubleLE((offset += 8) - 8); },
        s(type) {
            let s = buffer.toString('utf8', offset, offset += +type.slice(1));
            let end = s.indexOf('\0');
            if (end >= 0) s = s.slice(0, end);
            return s;
        },
    };
    const lenReaders = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16LE((offset += 2) - 2); },
        u32() { return buffer.readUInt32LE((offset += 4) - 4); },
    };
    function recursion(struct) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must folow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let reader = lenReaders[typeLength];
                if (reader) struct[keyArray] = reader(typeLength);
                else throw TypeError(`Unknown type "${typeLength}"`);
                let item = JSON.stringify(struct[key]);
                struct[key] = [];
                for (let i = 0; i < struct[keyArray]; i++) struct[key].push(JSON.parse(item));
                recursion(struct[key]);
                delete struct[keyArray];//v
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (object[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                let typeLength = object[keyString];
                let reader = lenReaders[typeLength];
                if (reader) object[keyString] = reader(typeLength);
                else throw TypeError(`Unknown type "${typeLength}"`);
                object[key] = buffer.toString('utf8', offset, offset += object[keyString]);
                delete object[keyString];//v
                keyString = undefined;
                continue;
            }
            if (key.endsWith('.array')) { keyArray = key; continue; }
            else if (key.endsWith('.string')) { keyString = key; continue; }
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            switch (typeof type) {
                case 'object': recursion(struct[key]); break;
                case 'string':
                    let reader = readers[type[0] === 's' ? 's' : type];//moze podobnie jak w parse
                    if (reader) struct[key] = reader(type);
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(object);
    return [object, offset];
}
module.exports.readBufferLE = readBufferLE;

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
/**@param {Object} uTypes*/
/**@returns {Array.<object, number>}*/ //[readObject, offset]
const writeBufferLE = (buffer, struct, object, { offset = 0 } = {}) => {
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16LE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32LE(val, (offset += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatLE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleLE(val, (offset += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(val) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(val) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
    };
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let writter = lenWritters[typeLength];
                if (writter) writter(object[key].length);
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) recursion(struct[key], object[key][i]);
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (struct[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = struct[keyString];
                let writter = lenWritters[typeLength];
                if (writter) {
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                let len = buffer.write(object[key], offset); offset += len;
                keyString = undefined;
                continue;
            }
            if (key.endsWith('.array')) { keyArray = key; continue; }
            else if (key.endsWith('.string')) { keyString = key; continue; }
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            switch (typeof type) {
                case 'object': recursion(struct[key], object[key]); break;
                case 'string':
                    let writter = writters[type[0] === 's' ? 's' : type];
                    if (writter) writter(type, object[key]);
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(struct, object);
    return offset;
}
module.exports.writeBufferLE = writeBufferLE;

function makeBufferLE(struct, object, { protect = false, trim = true } = {}) {
    struct = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    let buffer = Buffer.allocUnsafe(PRE_ALLOC_SIZE);
    let offset = 0;
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16LE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32LE(val, (offset += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatLE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleLE(val, (offset += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(val) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(val) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
    };
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let writter = lenWritters[typeLength];
                if (writter) {
                    let add = 4;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) {
                    switch (typeof struct[key]) {
                        case 'object': recursion(struct[key], object[key][i]); break;
                        case 'string':
                            console.log(struct[key]);
                            let writter = writters[struct[key] === 's' ? 's' : struct[key]];
                            if (writter) {
                                let add = struct[key][0] == 's' ? +type.slice(1) : 4;
                                if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                                writter(struct[key], object[key][i]);
                            }
                            else throw TypeError(`Unknown type "${type}"`);
                            break;
                        default: throw TypeError(`Unknown type "${type}"`);
                    }
                }
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (struct[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = struct[keyString];
                let writter = lenWritters[typeLength];
                if (writter) {
                    let add = 4 + object[key].length;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                let len = buffer.write(object[key], offset); offset += len;
                keyString = undefined;
                continue;
            }
            if (key.endsWith('.array')) { keyArray = key; continue; }
            else if (key.endsWith('.string')) { keyString = key; continue; }
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            switch (typeof type) {
                case 'object': recursion(struct[key], object[key]); break;
                case 'string':
                    let writter = writters[type[0] === 's' ? 's' : type];
                    if (writter) {
                        let add = type[0] == 's' ? +type.slice(1) : 4;
                        if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                        writter(type, object[key]);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(struct, object);
    if (trim) buffer = buffer.slice(0, offset);
    return [buffer, offset];
}
module.exports.makeBufferLE = makeBufferLE;

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} struct*/ // struct $= {}, []
/**@param {Object} uTypes*/
function readBufferBE(buffer, struct, { protect = false, offset = 0 } = {}) {
    let object = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    const readers = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16BE((offset += 2) - 2); },
        u32() { return buffer.readUInt32BE((offset += 4) - 4); },
        i8() { return buffer.readInt8((offset += 1) - 1); },
        i16() { return buffer.readInt16BE((offset += 2) - 2); },
        i32() { return buffer.readInt32BE((offset += 4) - 4); },
        f() { return buffer.readFloatBE((offset += 4) - 4); },
        d() { return buffer.readDoubleBE((offset += 8) - 8); },
        s(type) {
            let s = buffer.toString('utf8', offset, offset += +type.slice(1));
            let end = s.indexOf('\0');
            if (end >= 0) s = s.slice(0, end);
            return s;
        },
    };
    const lenReaders = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16BE((offset += 2) - 2); },
        u32() { return buffer.readUInt32BE((offset += 4) - 4); },
    };
    function recursion(object) {
        let entries = Object.entries(object);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must folow array declaration 'akey.array'.`);
                let typeLength = object[keyArray];
                let reader = lenReaders[typeLength];
                if (reader) object[keyArray] = reader(typeLength);
                else throw TypeError(`Unknown type "${typeLength}"`);
                let item = JSON.stringify(object[key]);
                object[key] = [];
                for (let i = 0; i < object[keyArray]; i++) object[key].push(JSON.parse(item));
                recursion(object[key]);
                delete object[keyArray];//v
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (object[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                let typeLength = object[keyString];
                let reader = lenReaders[typeLength];
                if (reader) object[keyString] = reader(typeLength);
                else throw TypeError(`Unknown type "${typeLength}"`);
                object[key] = buffer.toString('utf8', offset, offset += object[keyString]);
                delete object[keyString];//v
                keyString = undefined;
                continue;
            }
            if (key.endsWith('.array')) { keyArray = key; continue; }
            else if (key.endsWith('.string')) { keyString = key; continue; }
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            switch (typeof type) {
                case 'object': recursion(object[key]); break;
                case 'string':
                    let reader = readers[type[0] === 's' ? 's' : type];//moze podobnie jak w parse
                    if (reader) object[key] = reader(type);
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(object);
    return [object, offset];
}
module.exports.readBufferBE = readBufferBE;

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
/**@param {Object} uTypes*/
const writeBufferBE = (buffer, struct, object, { offset = 0 } = {}) => {
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16BE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32BE(val, (offset += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatBE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleBE(val, (offset += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(val) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(val) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
    };
    function recursion(struct = 0, object) {
        let entries = Object.entries(struct);//todo move to for
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let writter = lenWritters[typeLength];
                if (writter) writter(object[key].length);
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) recursion(struct[key], object[key][i]);
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (struct[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = struct[keyString];
                let writter = lenWritters[typeLength];
                if (writter) {
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                let len = buffer.write(object[key], offset); offset += len;
                keyString = undefined;
                continue;
            }
            if (key.endsWith('.array')) { keyArray = key; continue; }
            else if (key.endsWith('.string')) { keyString = key; continue; }
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            switch (typeof type) {
                case 'object': recursion(struct[key], object[key]); break;
                case 'string':
                    let writter = writters[type[0] === 's' ? 's' : type];
                    if (writter) writter(type, object[key]);
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(struct, object);
    return offset;
}
module.exports.writeBufferBE = writeBufferBE;

function makeBufferBE(struct, object, { protect = false, trim = true } = {}) {
    struct = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    let buffer = Buffer.allocUnsafe(PRE_ALLOC_SIZE);
    let offset = 0;
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16BE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32BE(val, (offset += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatBE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleBE(val, (offset += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(val) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(val) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
    };
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let writter = lenWritters[typeLength];
                if (writter) {
                    let add = 4;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) {
                    switch (typeof struct[key]) {
                        case 'object': recursion(struct[key], object[key][i]); break;
                        case 'string':
                            console.log(struct[key]);
                            let writter = writters[struct[key] === 's' ? 's' : struct[key]];
                            if (writter) {
                                let add = struct[key][0] == 's' ? +type.slice(1) : 4;
                                if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                                writter(struct[key], object[key][i]);
                            }
                            else throw TypeError(`Unknown type "${type}"`);
                            break;
                        default: throw TypeError(`Unknown type "${type}"`);
                    }
                }
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (struct[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = struct[keyString];
                let writter = lenWritters[typeLength];
                if (writter) {
                    let add = 4 + object[key].length;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                let len = buffer.write(object[key], offset); offset += len;
                keyString = undefined;
                continue;
            }
            if (key.endsWith('.array')) { keyArray = key; continue; }
            else if (key.endsWith('.string')) { keyString = key; continue; }
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            switch (typeof type) {
                case 'object': recursion(struct[key], object[key]); break;
                case 'string':
                    let writter = writters[type[0] === 's' ? 's' : type];
                    if (writter) {
                        let add = type[0] == 's' ? +type.slice(1) : 4;
                        if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                        writter(type, object[key]);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(struct, object);
    if (trim) buffer = buffer.slice(0, offset);
    return [buffer, offset];
}
module.exports.makeBufferBE = makeBufferBE;
