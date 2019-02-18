// 'c_struct' - written by marekkrzyzowski 31.01.2019 0.6.0
'use strict';

// PRIVATE
function baseSize(type) {
    return {
        u8: 1, u16: 2, u32: 4,
        i8: 1, i16: 2, i32: 4,
        f: 4, d: 8
    }[type] || type[0] == 's' && +type.slice(1);
}

// PUBLIC

let PRE_ALLOC_SIZE = 200;
module.exports.PRE_ALLOC_SIZE = PRE_ALLOC_SIZE;

function parseBase(base) {
    let tmp = base;
    base = {};
    console.log(`"${tmp}"`);
    tmp = tmp.split(/;.*\n/);
    tmp;
    end: {
        for (let x of tmp) {
            x = x.trim();
            if (!x) continue;
            x = x.replace(';', '');
            console.log(`"${x}"`);
            let m = x.match(/^(\w[\w\d]*)\s*(.*)$/);
            if (m === null) throw Error('Syntax error');
            m;
            let [, type, r] = m;
            console.log([type, r]);
            r = r.split(/\s*,\s*/);// ','
            for (let x of r) {
                if (!x) continue;
                console.log(`"${x}"`);
                console.log(`"${type}"`);
                //base[x] = type;
                console.log(base);

                let m = x.match(/^(\w[\w\d]*|)\[(\d+|\w[\w\d]+)\]$/);
                m;
                if (m == null)          // not array
                    base[x] = type;
                else {                  // array
                    let [, k, s] = m;
                    console.log([k, s]);
                    type;
                    if (k)
                        if (s) {
                            console.log(s);
                            console.log(+s);
                            type;
                            //error 
                            if (Number.isNaN(+s)) {
                                let ltype = type.toLowerCase();
                                if (ltype == 'string') {
                                    base[k + '.string'] = s;
                                    base[k] = 'string';
                                }
                                else {
                                    base[k + '.array'] = s;
                                    base[k] = type;
                                }
                            }
                            else
                                base[k] = Array(+s).fill(type);
                        }
                        else
                            throw Error('Syntax error');
                    else
                        if (s) {
                            base = Array(+s).fill(type);
                            break end;
                        }
                        else
                            throw Error('Syntax error');
                }
            }
            console.log(base);
        }
    }
    return base;
}
module.exports.parseBase = parseBase;

function parseTypes(types) {
    let tmp = types;
    types = {};
    tmp = tmp.replace(/\n/g, '');
    console.log(`"${tmp}"`);
    tmp;
    let m = tmp.match(/[\s\w]*\{[\w\d\s,;\[\]]+\}\s*;/g);
    if (m === null) throw Error('Syntax error');
    m;
    for (let x of m) {
        if (!x) continue;
        x = x.trim();
        console.log(`"${x}"`);
        let m = x.match(/(\w[\w\d]*)\s*\{\s*(.*);\s*\}\s*;/);
        if (m === null) throw Error('Syntax error');
        let [, type, r] = m;
        console.log([type, r]);
        types[type] = {};
        types;
        m = r.match(/(\w+[\w\d]*)\s*([\w\d\s,\[\]]+)/);
        if (m === null) throw Error('Syntax error');
        m;
        let t;
        [, t, r] = m;
        console.log([t, r]);
        r = r.split(/\s*,\s*/);// ','
        console.log([t, r]);
        for (let x of r) {
            x = x.trim();
            console.log(`"${x}"`);
            console.log(types[type]);
            let m = x.match(/^(\w[\w\d]*)\[(\d+)\]$/);
            m;
            if (m == null)          // not array
                types[type][x] = t;
            else {                  // array
                let [, n, s] = m;
                console.log([n, s]);
                types[type][n] = Array(+s).fill(t);
            }
        }
        console.log(types[type]);
    }
    return types;
}
module.exports.parseTypes = parseTypes;

/**@param {(Object|Array)} base*/ // struct $= {}, []
/**@param {Object} types*/
/**@param {Boolean} protect*/
/**@returns {(Object, Array)}*/ //processed struct
function parseStruct(base, types = {}) {
    let result;

    // BASE STRUCT
    if (typeof base === 'string') {
        result = parseBase(base);
    }
    else if (typeof base !== 'object') {
        result = JSON.parse(JSON.stringify(base)); //copy
    }
    else {
        throw TypeError(`Base struct must be 'object' or 'string'.`);
    }
    result;

    // USER TYPES
    if (typeof types == 'string') {
        types = parseTypes(types);
    }
    else if (typeof types !== 'object') {
        throw TypeError(`Base struct must be 'object' or 'string'.`);
    }
    types;

    // INTEGRATE BASE WITH USER TYPES
    function recursion(struct) {
        let entries = Object.entries(struct);
        for (let [key, type] of entries) {
            switch (typeof type) {
                case 'object': recursion(struct[key]); break;
                case 'string':
                    let size = baseSize(type);
                    if (size !== false) { break; }
                    if (types[type]) {
                        recursion(struct[key] = Object.assign((Array.isArray(types[type]) ? [] : {}), types[type]), key);
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
//todo clear comments
// let struct = parseStruct(
//     `u8 a, b, c;`
// );
// // Xy[5];
// struct;
module.exports.parseStruct = parseStruct;

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} struct*/ // struct $= {}, []
/**@returns {Array.<object, number>}*/ //[readObject, offset]
function readLE(buffer, struct, offset = 0) {
    const leReaders = {
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
    const leLenReaders = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16LE((offset += 2) - 2); },
        u32() { return buffer.readUInt32LE((offset += 4) - 4); },
    };
    let object = struct;
    function recursion(struct) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must folow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let reader = leLenReaders[typeLength];
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
                let reader = leLenReaders[typeLength];
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
                    let reader = leReaders[type[0] === 's' ? 's' : type];//moze podobnie jak w parse
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
// let struct = { a: 'u8', b: 'u8', c: 'u8' };
// let buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
// buffer;
// struct;
// let read = readLE(buffer, struct, 2);
// read;
module.exports.readLE = readLE;

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
/**@returns {Array.<object, number>}*/ //[readObject, offset]
const writeLE = (buffer, struct, object, offset = 0) => {
    const leWritters = {
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
    const leLenWritters = {
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
                let writter = leLenWritters[typeLength];
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
                let writter = leLenWritters[typeLength];
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
                    let writter = leWritters[type[0] === 's' ? 's' : type];
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
module.exports.writeLE = writeLE;

function makeLE(struct, object, trim = true) {
    const leWritters = {
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
    const leLenWritters = {
        u8(val) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(val) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(val) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
    };
    let buffer = Buffer.allocUnsafe(PRE_ALLOC_SIZE);
    let offset = 0;
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let writter = leLenWritters[typeLength];
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
                            let writter = leWritters[struct[key] === 's' ? 's' : struct[key]];
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
                let writter = leLenWritters[typeLength];
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
                    let writter = leWritters[type[0] === 's' ? 's' : type];
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
//let make = makeLE({ a: 'u8', b: 'u8', c: 'u8' }, { a: 65, b: 66, c: 67 });
//make;
module.exports.makeLE = makeLE;

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} struct*/ // struct $= {}, []
function readBE(buffer, struct, offset = 0) {
    const beReaders = {
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
    const beLenReaders = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16BE((offset += 2) - 2); },
        u32() { return buffer.readUInt32BE((offset += 4) - 4); },
    };
    let object = struct;
    function recursion(object) {
        let entries = Object.entries(object);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must folow array declaration 'akey.array'.`);
                let typeLength = object[keyArray];
                let reader = beLenReaders[typeLength];
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
                let reader = beLenReaders[typeLength];
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
                    let reader = beReaders[type[0] === 's' ? 's' : type];//moze podobnie jak w parse
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
module.exports.readBE = readBE;

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
const writeBE = (buffer, struct, object, offset = 0) => {
    const beWritters = {
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
    const beLenWritters = {
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
                let writter = beLenWritters[typeLength];
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
                let writter = beLenWritters[typeLength];
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
                    let writter = beWritters[type[0] === 's' ? 's' : type];
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
module.exports.writeBE = writeBE;

function makeBE(struct, object, trim = true) {
    const beWritters = {
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
    const beLenWritters = {
        u8(val) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(val) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(val) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
    };
    let buffer = Buffer.allocUnsafe(PRE_ALLOC_SIZE);
    let offset = 0;
    function recursion(struct, object) {
        let entries = Object.entries(struct);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = struct[keyArray];
                let writter = beLenWritters[typeLength];
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
                            let writter = beWritters[struct[key] === 's' ? 's' : struct[key]];
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
                let writter = beLenWritters[typeLength];
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
                    let writter = beWritters[type[0] === 's' ? 's' : type];
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
module.exports.makeBE = makeBE;

// Class C_Struct
class C_Struct {
    constructor(base, types) {
        this._offset = 0;
        // PREPROCESOR
        let struct = parseStruct(base, types);
        this._struct = JSON.stringify(struct);
    }
    get offset() { return this._offset; }
    set offset(v) { this._offset = v; }
    get struct() { return JSON.parse(this._struct); }
    readLE(buffer, offset) {
        buffer;
        this._offset = offset || this._offset;
        let [read, offs] = readLE(buffer, this.struct, this._offset);
        this._offset = offs;
        return read;
    }
    writeLE(buffer, object, offset) {
        this._offset = offset || this._offset;
        this.offset = writeLE(buffer, this.struct, object, this._offset);
        return this.offset;
    }
    makeLE(object, trim) {
        this._offset = 0;
        let [make, offs] = makeLE(this.struct, object, trim);
        this._offset = offs;
        return make;
    }
    readBE(buffer, offset) {
        buffer;
        this._offset = offset || this._offset;
        let [read, offs] = readBE(buffer, this.struct, this._offset);
        this._offset = offs;
        return read;
    }
    writeBE(buffer, object, offset) {
        this._offset = offset || this._offset;
        this.offset = writeBE(buffer, this.struct, object, this._offset);
        return this.offset;
    }
    makeBE(object, trim) {
        this._offset = 0;
        let [make, offs] = makeBE(this.struct, object, trim);
        this._offset = offs;
        return make;
    }
}
module.exports.C_Struct = C_Struct;