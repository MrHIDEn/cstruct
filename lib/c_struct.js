// library: 'c_struct'
// author: Marek Krzyzowski
// begin: 31.01.2019
// last: 16.10.2019
// version: 0.8.0

'use strict';

/**
 * Advanced parser
 * Parse MODEL
 * Parse TYPES
 * Uses Object, JSON, C_Struct lang (kind of C)
 * 
 * @param {object|string} model
 * @param {object|string|undefined} types
 * @returns {string} model
 */
function jparser(model, types) {
    switch (typeof types) {
        case "string":
            types = jparser(types);
            types = JSON.parse(types);
        case "object":
            types = Object.entries(types);
            break;
    }
    let m;
    let y = (typeof model === 'string') ? model : JSON.stringify(model); // stringify
    y = y.replace(/\/\/.*$/gm, ``); // remove comments
    y = y.replace(/^\s+$/m, ``); // remove empty lines
    y = y.replace(/\s{2,}/g, ` `); // reduce ' ' to one ' '
    y = y.replace(/\n/g, ``); // remove line breaks
    y = y.replace(/\s*,\s*/g, `,`); //x remove spaces before/after ,
    y = y.replace(/\s*([}\]])\s*;?\s*/g, `$1`); // remove ending ; for } or ] and trim ' ' on start and ' '
    y = y.replace(/([{\[])\s*(\w)/g, `$1$2`); // remove spaces after { or [
    y = y.replace(/([}\]])\s*(\w+)/g, `$1,$2`); // add , between keys
    y = y.replace(/([\w0-9])\s*:?\s*([{\[])/g, `$1:$2`); // add missing : between key and { or [ and remove ' ' around :
    y = y.replace(/\s*:\s*/g, ':'); // remove spaces around :
    y = y.replace(/\"/g, ''); // remove all "

    // Special
    // `{Type Key[2]}` => `{Key:[Type,Type]}`, n times
    // `{Type Key[u8]}` => `{Key.array:u8,Key:Type}`
    // `{string Key[2]}` => `{Key:s2}`
    // `{string Key[u8]}` => `{Key.string:u8,Key:string}`
    m = (y.match(/\w+ \w+:\[\w+\]/g) || []);
    for(let x of m) {
        const m = x.match(/(\w+) (\w+):\[(\w+)\]/);
        if (m !== null && m.length === 4) {
            let [, t, k, n] = m;
            n = +n || n;
            let nan = +Number.isNaN(+n);
            let r = t === "string"
                ? [`${k}:s${n}`, `${k}.string:${n},${k}:${t}`][nan]
                : [`${k}:[${Array(n).fill(t)}]`, `${k}.array:${n},${k}:${t}`][nan];
            y = y.split(x).join(r);
        }
    }

    // Special
    // `u8 [3];` => `["u8","u8","u8"]`
    // `string [3];` => `s3`
    m = (y.match(/\w+:\[\w+\]/g) || []);
    for(let x of m) {
        const m = x.match(/(\w+):\[(\w+)\]/);
        if (m !== null && m.length === 3) {
            let [, t, n] = m;
            n = +n || n;
            let nan = +Number.isNaN(+n);
            if(nan===1) throw Error(`Syntax error '${x}'`);
            let r = t === "string"
                ? `s${n}`
                : `[${Array(n).fill(t)}]`;
            y = y.split(x).join(r);
        }
    }

    // Special: a[u8/u8],a[3/u8],a[u8/string],a[3/string]
    // A) array, <k>:[<n>/<t>], k-key, n-size, t-type
    // A1 <k>:[<t>, ...], when <n> is number
    // A2 <k>.array:<s>,<k>:<t>, when <n> is string (u8, ect)
    // S) string, <k>:[<s>/string], k-key, n-size, string
    // S1 <k>:s<n>, when <n> is number
    // S2 <k>.string:u8,<k>:string, when <n> is string (u8, ect)
    m = (y.match(/\w+:\[\w+\/\w+=?\w*\]/g) || []);
    for(let x of m) {
        const m = x.match(/(\w+):\[(\w+)\/(\w+)\]/);
        if (m !== null && m.length === 4) {
            let [, k, n, t] = m;
            n = +n || n;
            let nan = +Number.isNaN(+n);
            let r = t === "string"
                ? [`${k}:s${n}`, `${k}.string:${n},${k}:${t}`][nan]
                : [`${k}:[${Array(n).fill(t)}]`, `${k}.array:${n},${k}:${t}`][nan];
            y = y.split(x).join(r);
        }
    }

    // [<n>/<t>], n-size, t-type
    // [<t>, ...]
    m = (y.match(/\[\w+\/\w+=?\w*\]/g) || []);
    for(let x of m) {
        const m = x.match(/\[(\w+)\/(\w+)\]/);
        if (m !== null && m.length === 3) {
            let [, n, t] = m;
            n = +n || -1;
            if (n>=0) {
                let r = `[${Array(n).fill(t)}]`;
                y = y.split(x).join(r);
            } else { 
                throw Error("Syntax error"); 
            }
        }
    }


    // `{<t> <v1>,<v2>,...}`
    // `{<v1>:<t>,<v2>:<t>,...}`
    m = (y.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) || []);
    for (let x of m) {
        const m = x.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
        if (m !== null && m.length === 3) {
            let [, t, r] = m;
            r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
        }
    }

    // `<t> <v1>,<v2>,...`
    // `{<v1>:<t>,<v2>:<t>,...}`
    m = (y.match(/([_a-zA-Z]\w*)\s+([\w0-9,]+);/g) || []);
    for (let x of m) {
        const m = x.match(/([_a-zA-Z]\w*)\s*(.*);/);
        if (m !== null && m.length === 3) {
            let [, t, r] = m;
            r = `${r.split(/\s*,\s*/).map(k => `${k}:${t},`).join('')}`;
            y = y.split(x).join(r);
        }
    }
    y = y.replace(/,([}\]])/g, '$1'); // remove last useless ','

    y = y.replace(/([}\]])\s*([{\[\w])/g, '$1,$2'); // add missing ',' between }] and {[

    y = y.replace(/([_a-zA-Z]\w*\.?\w*)/g, '"$1"'); // Add missing ""

    // Replace model types with user types
    if(Array.isArray(types)) {
        // replace model with user types, stage 1
        types.forEach(([k, v]) => y = y.split(`"${k}"`).join(JSON.stringify(v)));
        // reverse user types to replace nested user types
        types = types.reverse();
        // replace model with reverse user types, stage 2
        types.forEach(([k, v]) => y = y.split(`"${k}"`).join(JSON.stringify(v)));
    }

    try {
        y = JSON.parse(y);
        return JSON.stringify(y); // return fixed json
    } catch (error) {
        throw Error(`Syntax error '${y}'`);
    }
}

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} model*/ // struct $= {}, []
/**@returns {Array.<object, number>}*/ //[readObject, offset]
function readLE(buffer, model, offset = 0) {
    const leLenReaders = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16LE((offset += 2) - 2); },
        u32() { return buffer.readUInt32LE((offset += 4) - 4); },
        u64() { return buffer.readBigUInt64LE((offset += 8) - 8); },
        i8() { return buffer.readInt8((offset += 1) - 1); },
        i16() { return buffer.readInt16LE((offset += 2) - 2); },
        i32() { return buffer.readInt32LE((offset += 4) - 4); },
        i64() { return buffer.readBigInt64LE((offset += 8) - 8); },
        f() { return buffer.readFloatLE((offset += 4) - 4); },
        d() { return buffer.readDoubleLE((offset += 8) - 8); },
    };
    const leReaders = Object.assign({
        s(type) {
            let s = buffer.toString('utf8', offset, offset += +type.slice(1));
            let end = s.indexOf('\0');
            if (end >= 0) s = s.slice(0, end);
            return s;
        },
    }, leLenReaders);
    let object = model;
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

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} model*/ // model $= {}, []
/**@param {(Object|Array)} object*/
/**@returns {Array.<object, number>}*/ //[readObject, offset]
const writeLE = (buffer, model, object, offset = 0) => {
    const leLenWritters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
        u64(type, val = 0) { buffer.writeBigUInt64LE(val, (offset += 8) - 8); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16LE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32LE(val, (offset += 4) - 4); },
        i64(type, val = 0) { buffer.writeBigInt64LE(val, (offset += 8) - 8); },
        f(type, val = 0) { buffer.writeFloatLE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleLE(val, (offset += 8) - 8); },
    };
    const leWritters = Object.assign({
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    }, leLenWritters);
    function recursion(model, object) {
        let entries = Object.entries(model);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = model[keyArray];
                let writter = leLenWritters[typeLength];
                if (writter) writter(object[key].length);
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) recursion(model[key], object[key][i]);
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (model[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = model[keyString];
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
                case 'object': recursion(model[key], object[key]); break;
                case 'string':
                    let writter = leWritters[type[0] === 's' ? 's' : type];
                    if (writter) writter(type, object[key]);
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(model, object);
    return offset;
}

function makeLE(model, object, trim = true, preAllocSize = 200) {
    let buffer = Buffer.allocUnsafe(preAllocSize);
    let offset = 0;
    const leLenWritters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16LE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32LE(val, (offset += 4) - 4); },
        u64(type, val = 0) { buffer.writeBigUInt64LE(val, (offset += 8) - 8); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16LE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32LE(val, (offset += 4) - 4); },
        i64(type, val = 0) { buffer.writeBigInt64LE(val, (offset += 8) - 8); },
        f(type, val = 0) { buffer.writeFloatLE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleLE(val, (offset += 8) - 8); },
    };
    const leWritters = Object.assign({
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    }, leLenWritters);
    function recursion(model, object) {
        let entries = Object.entries(model);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = model[keyArray];
                let writter = leLenWritters[typeLength];
                if (writter) {
                    let add = 4;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) {
                    switch (typeof model[key]) {
                        case 'object': recursion(model[key], object[key][i]); break;
                        case 'string':
                            let writter = leWritters[model[key] === 's' ? 's' : model[key]];
                            if (writter) {
                                let add = model[key][0] == 's' ? +type.slice(1) : 4;
                                if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                                writter(model[key], object[key][i]);
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
                if (model[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = model[keyString];
                let writter = leLenWritters[typeLength];
                if (writter) {
                    let add = 4 + object[key].length;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
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
                case 'object': recursion(model[key], object[key]); break;
                case 'string':
                    let writter = leWritters[type[0] === 's' ? 's' : type];
                    if (writter) {
                        let add = type[0] == 's' ? +type.slice(1) : 4;
                        if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                        writter(type, object[key]);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(model, object);
    if (trim) buffer = buffer.slice(0, offset);
    return [buffer, offset];
}

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} model*/ // model $= {}, []
function readBE(buffer, model, offset = 0) {
    const beLenReaders = {
        u8() { return buffer.readUInt8((offset += 1) - 1); },
        u16() { return buffer.readUInt16BE((offset += 2) - 2); },
        u32() { return buffer.readUInt32BE((offset += 4) - 4); },
        u64() { return buffer.readBigUInt64BE((offset += 8) - 8); },
        i8() { return buffer.readInt8((offset += 1) - 1); },
        i16() { return buffer.readInt16BE((offset += 2) - 2); },
        i32() { return buffer.readInt32BE((offset += 4) - 4); },
        i64() { return buffer.readBigInt64BE((offset += 8) - 8); },
        f() { return buffer.readFloatBE((offset += 4) - 4); },
        d() { return buffer.readDoubleBE((offset += 8) - 8); },
    };
    const beReaders = Object.assign({
        s(type) {
            let s = buffer.toString('utf8', offset, offset += +type.slice(1));
            let end = s.indexOf('\0');
            if (end >= 0) s = s.slice(0, end);
            return s;
        },
    }, beLenReaders);
    let object = model;
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

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} model*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
const writeBE = (buffer, model, object, offset = 0) => {
    const beLenWritters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
        u64(type, val = 0) { buffer.writeBigUInt64BE(val, (offset += 8) - 8); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16BE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32BE(val, (offset += 4) - 4); },
        i64(type, val = 0) { buffer.writeBigInt64BE(val, (offset += 8) - 8); },
        f(type, val = 0) { buffer.writeFloatBE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleBE(val, (offset += 8) - 8); },
    };
    const beWritters = Object.assign({
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    }, beLenWritters);
    function recursion(model, object) {
        let entries = Object.entries(model);//todo move to for
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = model[keyArray];
                let writter = beLenWritters[typeLength];
                if (writter) writter(object[key].length);
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) recursion(model[key], object[key][i]);
                keyArray = undefined;
                continue;
            }
            else if (keyString !== undefined) {
                if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'akey' must follow string declaration 'akey.string'.`);
                if (model[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = model[keyString];
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
                case 'object': recursion(model[key], object[key]); break;
                case 'string':
                    let writter = beWritters[type[0] === 's' ? 's' : type];
                    if (writter) writter(type, object[key]);
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(model, object);
    return offset;
}

function makeBE(model, object, trim = true, preAllocSize = 200) {
    let buffer = Buffer.allocUnsafe(preAllocSize);
    let offset = 0;
    const beLenWritters = {
        u8(type, val = 0) { buffer.writeUInt8(val, (offset += 1) - 1); },
        u16(type, val = 0) { buffer.writeUInt16BE(val, (offset += 2) - 2); },
        u32(type, val = 0) { buffer.writeUInt32BE(val, (offset += 4) - 4); },
        u64(type, val = 0) { buffer.writeBigUInt64BE(val, (offset += 8) - 8); },
        i8(type, val = 0) { buffer.writeInt8(val, (offset += 1) - 1); },
        i16(type, val = 0) { buffer.writeInt16BE(val, (offset += 2) - 2); },
        i32(type, val = 0) { buffer.writeInt32BE(val, (offset += 4) - 4); },
        i64(type, val = 0) { buffer.writeBigInt64BE(val, (offset += 8) - 8); },
        f(type, val = 0) { buffer.writeFloatBE(val, (offset += 4) - 4); },
        d(type, val = 0) { buffer.writeDoubleBE(val, (offset += 8) - 8); },
    };
    const beWritters = Object.assign({
        s(type, val = '') { let len = +type.slice(1); buffer.write(val.padEnd(len, '\0'), offset, len); offset += len; },
    }, beLenWritters);
    function recursion(model, object) {
        let entries = Object.entries(model);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            if (keyArray !== undefined) {
                if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'akey' must follow array declaration 'akey.array'.`);
                if (!Array.isArray(object[key])) throw SyntaxError(`An array 'akey' must follow array declaration 'akey.array'.`);
                let typeLength = model[keyArray];
                let writter = beLenWritters[typeLength];
                if (writter) {
                    let add = 4;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) {
                    switch (typeof model[key]) {
                        case 'object': recursion(model[key], object[key][i]); break;
                        case 'string':
                            let writter = beWritters[model[key] === 's' ? 's' : model[key]];
                            if (writter) {
                                let add = model[key][0] == 's' ? +type.slice(1) : 4;
                                if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                                writter(model[key], object[key][i]);
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
                if (model[key] != 'string') throw SyntaxError(`An object 'akey' must be type 'string' after string declaration 'akey.string'.`);
                if (typeof object[key] != 'string') throw SyntaxError(`An folowed 'akey' must equal 'string' after declaration 'akey.string'.`);
                let typeLength = model[keyString];
                let writter = beLenWritters[typeLength];
                if (writter) {
                    let add = 4 + object[key].length;
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
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
                case 'object': recursion(model[key], object[key]); break;
                case 'string':
                    let writter = beWritters[type[0] === 's' ? 's' : type];
                    if (writter) {
                        let add = type[0] == 's' ? +type.slice(1) : 4;
                        if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                        writter(type, object[key]);
                    }
                    else throw TypeError(`Unknown type "${type}"`);
                    break;
                default: throw TypeError(`Unknown type "${type}"`);
            }
        }
    }
    recursion(model, object);
    if (trim) buffer = buffer.slice(0, offset);
    return [buffer, offset];
}

/**
 * C_Struct
 * Binary/Object and vice versa parser for JavaScript
 */
class C_Struct {
    /**
     * Parse MODEL,
     * Parse TYPES,
     * Uses Object, JSON, C_Struct lang (kind of C)
     * 
     * @param {object|string} model
     * @param {object|string|undefined} types OPTIONAL
     * @param {number} preAllocSize OPTIONAL
     * @returns {string} C_Struct model to read/write/make binary Buffer right into/from Object/Array
     */
    constructor(model, types, preAllocSize = 200) {
        this._offset = 0;
        this._model = jparser(model, types); // Preprocesor, [JSON string]
        this._preAllocSize = Math.max(100, +preAllocSize | 0);
    }
    get preAllocSize() { return this._preAllocSize; }
    set preAllocSize(v) { this._preAllocSize = v; }
    get offset() { return this._offset; }
    set offset(v) { this._offset = v; }
    /** @returns {string} JSON */
    get jsonModel() { return this._model; }
    /**@returns {object} {} or [] */
    get model() { return JSON.parse(this._model); }
    readLE(buffer, offset = undefined) {
        if (offset !== undefined) this._offset = offset;
        let [read, o] = readLE(buffer, this.model, this._offset);
        this._offset = o;
        return read;
    }
    writeLE(buffer, object, offset = undefined) {
        if (offset !== undefined) this._offset = offset;
        this.offset = writeLE(buffer, this.model, object, this._offset);
        return this.offset;
    }
    makeLE(object, trim = true) {
        this._offset = 0;
        let [make, o] = makeLE(this.model, object, trim, this._preAllocSize);
        this._offset = o;
        return make;
    }
    readBE(buffer, offset = undefined) {
        if (offset !== undefined) this._offset = offset;
        let [read, o] = readBE(buffer, this.model, this._offset);
        this._offset = o;
        return read;
    }
    writeBE(buffer, object, offset = undefined) {
        if (offset !== undefined) this._offset = offset;
        this.offset = writeBE(buffer, this.model, object, this._offset);
        return this.offset;
    }
    makeBE(object, trim = true) {
        this._offset = 0;
        let [make, o] = makeBE(this.model, object, trim, this._preAllocSize);
        this._offset = o;
        return make;
    }
}

module.exports.C_Struct = C_Struct;

module.exports.$test = {
    jparser,

    readLE,
    writeLE,
    makeLE,

    readBE,
    writeBE,
    makeBE,
};

// clear code regex
// `^\s*((?!break|continue)\w+|console\..*);\n` => ``