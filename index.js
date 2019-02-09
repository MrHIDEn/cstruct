// written by marekkrzyzowski 31.01.2019 0.3.0
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
/**@param {Number} position*/
/**@param {Object|Array} struct*/ // struct $= {}, []
/**@param {Object} uTypes*/
/**@returns {Array.<object, number>}*/ //[readObject, position]
function readBufferLe(buffer, struct, { protect = false, position = 0 } = {}) {
    let object = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    const readers = {
        u8() { return buffer.readUInt8((position += 1) - 1); },
        u16() { return buffer.readUInt16LE((position += 2) - 2); },
        u32() { return buffer.readUInt32LE((position += 4) - 4); },
        i8() { return buffer.readInt8((position += 1) - 1); },
        i16() { return buffer.readInt16LE((position += 2) - 2); },
        i32() { return buffer.readInt32LE((position += 4) - 4); },
        f() { return buffer.readFloatLE((position += 4) - 4); },
        d() { return buffer.readDoubleLE((position += 8) - 8); },
        s(type) {
            let s = buffer.toString('utf8', position, position += +type.slice(1));
            let end = s.indexOf('\0');
            if (end >= 0) s = s.slice(0, end);
            return s;
        },
    };
    const lenReaders = {
        u8() { return buffer.readUInt8((position += 1) - 1); },
        u16() { return buffer.readUInt16LE((position += 2) - 2); },
        u32() { return buffer.readUInt32LE((position += 4) - 4); },
    };
    function recursion(struct) {
        let entries = Object.entries(struct);
        let keySize;
        for (let [key, type] of entries) {
            if (keySize !== undefined) {
                if (keySize.slice(0, -5) !== key) throw SyntaxError(`A key 'akey' must folow array declaration 'akey.size'.`);
                let typeLength = struct[keySize];
                let reader = lenReaders[typeLength];
                if (reader) struct[keySize] = reader(typeLength);
                else throw TypeError(`Unknown type "${typeLength}"`);
                let item = JSON.stringify(struct[key]);
                struct[key] = [];
                for (let i = 0; i < struct[keySize]; i++) struct[key].push(JSON.parse(item));
                recursion(struct[key]);
                delete struct[keySize];//v
                keySize = undefined;
                continue;
            }
            if (key.endsWith('.size')) { keySize = key; continue; }
            else keySize = undefined;
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
    return [object, position];
}
module.exports.readBufferLe = readBufferLe;

/**@param {Buffer} buffer*/
/**@param {Number} position*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
/**@param {Object} uTypes*/
/**@returns {Array.<object, number>}*/ //[readObject, position]
const writeBufferLe = (buffer, struct, object, { position = 0 } = {}) => {
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16LE(val, (position += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32LE(val, (position += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (position += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16LE(val, (position += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32LE(val, (position += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatLE(val, (position += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleLE(val, (position += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), position, len); position += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(val) { buffer.writeUInt16LE(val, (position += 2) - 2); },
        u32(val) { buffer.writeUInt32LE(val, (position += 4) - 4); },
    };
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keySize;
        for (let [key, type] of entries) {
            if (keySize !== undefined) {
                if (keySize.slice(0, -5) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.size'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.size'.`);
                let typeLength = struct[keySize];
                let writter = lenWritters[typeLength];
                if (writter) writter(object[key].length);
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) recursion(struct[key], object[key][i]);
                keySize = undefined;
                continue;
            }
            if (key.endsWith('.size')) { keySize = key; continue; }
            else keySize = undefined;
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
    return position;
}
module.exports.writeBufferLe = writeBufferLe;

function makeBufferLe(struct, object, { protect = false, trim = true } = {}) {
    struct = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    let buffer = Buffer.allocUnsafe(PRE_ALLOC_SIZE);
    let position = 0;
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16LE(val, (position += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32LE(val, (position += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (position += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16LE(val, (position += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32LE(val, (position += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatLE(val, (position += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleLE(val, (position += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), position, len); position += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(val) { buffer.writeUInt16LE(val, (position += 2) - 2); },
        u32(val) { buffer.writeUInt32LE(val, (position += 4) - 4); },
    };
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keySize;
        for (let [key, type] of entries) {
            if (keySize !== undefined) {
                if (keySize.slice(0, -5) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.size'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.size'.`);
                let typeLength = struct[keySize];
                let writter = lenWritters[typeLength];
                if (writter) {
                    let add = typeLength[0] == 's' ? +typeLength.slice(1) : 4;
                    if (buffer.length < position + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
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
                                if (buffer.length < position + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                                writter(struct[key], object[key][i]);
                            }
                            else throw TypeError(`Unknown type "${type}"`);
                        break;
                        default: throw TypeError(`Unknown type "${type}"`);
                    }
                }
                keySize = undefined;
                continue;
            }
            if (key.endsWith('.size')) { keySize = key; continue; }
            else keySize = undefined;
            switch (typeof type) {
                case 'object': recursion(struct[key], object[key]); break;
                case 'string':
                    let writter = writters[type[0] === 's' ? 's' : type];
                    if (writter) {
                        let add = type[0] == 's' ? +type.slice(1) : 4;
                        if (buffer.length < position + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                        writter(type, object[key]);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(struct, object);
    if (trim) buffer = buffer.slice(0, position);
    return [buffer, position];
}
let [s, t, o, r, y] = [
    { 'a.size': 'u16', a: 'u16' },
    { },
    { a:[12,13,14] }
];
r = parseStruct(s, t);
s;
r;
y = makeBufferLe(r, o);
y;
module.exports.makeBufferLe = makeBufferLe;

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} position*/
/**@param {Object|Array} struct*/ // struct $= {}, []
/**@param {Object} uTypes*/
function readBufferBe(buffer, struct, { protect = false, position = 0 } = {}) {
    let object = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    const readers = {
        u8() { return buffer.readUInt8((position += 1) - 1); },
        u16() { return buffer.readUInt16BE((position += 2) - 2); },
        u32() { return buffer.readUInt32BE((position += 4) - 4); },
        i8() { return buffer.readInt8((position += 1) - 1); },
        i16() { return buffer.readInt16BE((position += 2) - 2); },
        i32() { return buffer.readInt32BE((position += 4) - 4); },
        f() { return buffer.readFloatBE((position += 4) - 4); },
        d() { return buffer.readDoubleBE((position += 8) - 8); },
        s(type) {
            let s = buffer.toString('utf8', position, position += +type.slice(1));
            let end = s.indexOf('\0');
            if (end >= 0) s = s.slice(0, end);
            return s;
        },
    };
    const lenReaders = {
        u8() { return buffer.readUInt8((position += 1) - 1); },
        u16() { return buffer.readUInt16BE((position += 2) - 2); },
        u32() { return buffer.readUInt32BE((position += 4) - 4); },
    };
    function recursion(struct) {
        let entries = Object.entries(struct);
        let keySize;
        for (let [key, type] of entries) {
            if (keySize !== undefined) {
                if (keySize.slice(0, -5) !== key) throw SyntaxError(`A key 'akey' must folow array declaration 'akey.size'.`);
                let typeLength = struct[keySize];
                let reader = lenReaders[typeLength];
                if (reader) struct[keySize] = reader(typeLength);
                else throw TypeError(`Unknown type "${typeLength}"`);
                let item = JSON.stringify(struct[key]);
                struct[key] = [];
                for (let i = 0; i < struct[keySize]; i++) struct[key].push(JSON.parse(item));
                recursion(struct[key]);
                delete struct[keySize];//v
                keySize = undefined;
                continue;
            }
            if (key.endsWith('.size')) { keySize = key; continue; }
            else keySize = undefined;
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
    return [object, position];
}
module.exports.readBufferBe = readBufferBe;

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} position*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
/**@param {Object} uTypes*/
const writeBufferBe = (buffer, struct, object, { position = 0 } = {}) => {
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16BE(val, (position += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32BE(val, (position += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (position += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16BE(val, (position += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32BE(val, (position += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatBE(val, (position += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleBE(val, (position += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), position, len); position += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(val) { buffer.writeUInt16BE(val, (position += 2) - 2); },
        u32(val) { buffer.writeUInt32BE(val, (position += 4) - 4); },
    };
    function recursion(struct = 0, object) {
        let entries = Object.entries(struct);//todo move to for
        let keySize;
        for (let [key, type] of entries) {
            if (keySize !== undefined) {
                if (keySize.slice(0, -5) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.size'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.size'.`);
                let typeLength = struct[keySize];
                let writter = lenWritters[typeLength];
                if (writter) writter(object[key].length);
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) recursion(struct[key], object[key][i]);
                keySize = undefined;
                continue;
            }
            if (key.endsWith('.size')) { keySize = key; continue; }
            else keySize = undefined;
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
    return position;
}
module.exports.writeBufferBe = writeBufferBe;

function makeBufferBe(struct, object, { protect = false, trim = true } = {}) {
    struct = !protect ? struct : JSON.parse(JSON.stringify(struct)); //copy
    let buffer = Buffer.allocUnsafe(PRE_ALLOC_SIZE);
    let position = 0;
    const writters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16BE(val, (position += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32BE(val, (position += 4) - 4); },
        i8(type, val = 0) { buffer.writeInt8(val, (position += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16BE(val, (position += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32BE(val, (position += 4) - 4); },
        f(type, val = 0) { buffer.writeFloatBE(val, (position += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleBE(val, (position += 8) - 8); },
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), position, len); position += len; },
    };
    const lenWritters = {
        u8(val) { buffer.writeUInt8(val, (position += 1) - 1); },
        u16(val) { buffer.writeUInt16BE(val, (position += 2) - 2); },
        u32(val) { buffer.writeUInt32BE(val, (position += 4) - 4); },
    };
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keySize;
        for (let [key, type] of entries) {
            if (keySize !== undefined) {
                if (keySize.slice(0, -5) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.size'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.size'.`);
                let typeLength = struct[keySize];
                let writter = lenWritters[typeLength];
                if (writter) {
                    let add = typeLength[0] == 's' ? +typeLength.slice(1) : 4;
                    if (buffer.length < position + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
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
                                if (buffer.length < position + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                                writter(struct[key], object[key][i]);
                            }
                            else throw TypeError(`Unknown type "${type}"`);
                        break;
                        default: throw TypeError(`Unknown type "${type}"`);
                    }
                }
                keySize = undefined;
                continue;
            }
            if (key.endsWith('.size')) { keySize = key; continue; }
            else keySize = undefined;
            switch (typeof type) {
                case 'object': recursion(struct[key], object[key]); break;
                case 'string':
                    let writter = writters[type[0] === 's' ? 's' : type];
                    if (writter) {
                        let add = type[0] == 's' ? +type.slice(1) : 4;
                        if (buffer.length < position + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, PRE_ALLOC_SIZE))]);
                        writter(type, object[key]);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(struct, object);
    if (trim) buffer = buffer.slice(0, position);
    return [buffer, position];
}
[s, t, o, r, y] = [
    { 'a.size': 'u16', a: 'u16' },
    { },
    { a:[12,13,14] }
];
r = parseStruct(s, t);
s;
r;
y = makeBufferBe(r, o);
y;
module.exports.makeBufferBe = makeBufferBe;
