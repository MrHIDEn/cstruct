// 'c_struct' - written by marekkrzyzowski 31.01.2019 0.7.0
'use strict';

/**
 * Return size of provided type
 * 
 * @param {string} type
 * @returns {number}
 */
function baseSize(type) {
    return {
        u8: 1, u16: 2, u32: 4, u64: 8,
        i8: 1, i16: 2, i32: 4, i64: 8,
        f: 4, d: 8
    }[type] || type[0] == 's' && +type.slice(1);
}

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
    // try to parse types
    switch (typeof types) {
        case "string":
            types = jparser(types); // clear, translate types string
            types = JSON.parse(types); // get types object { <k>: <t>, ... }, k-key, t-type
        case "object":
            types = Object.entries(types); // get types entries array
            break;
    }
    let y = (typeof model === 'string') ? model : JSON.stringify(model);
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
    y = y.replace(/([_a-zA-Z]\w*\s+[\w0-9,]+);/g, '{$1;}'); // close objects

    let m;

    /** Special: a[u8/u8],a[3/u8],a[u8/string],a[3/string]
     * A) array, <k>:[<n>/<t>], k-key, n-size, t-type
     * A1 <k>:[<t>, ...], when <n> is number
     * A2 <k>.array:<s>,<k>:<t>, when <n> is string (u8, ect)
     * S) string, <k>:[<s>/string], k-key, n-size, string
     * S1 <k>:s<n>, when <n> is number
     * S2 <k>.string:u8,<k>:string, when <n> is string (u8, ect)
     */
    m = (y.match(/\w+:\[\w+\/\w+=?\w*\]/g) || []);
    for(let x of m) {
        const m = x.match(/(\w+):\[(\w+)\/(\w+)\]/);
        if (m !== null && m.length === 4) {
            let [, k, n, t] = m;
            n = +n || n;
            let nan = +Number.isNaN(+n);//?
            let r = t === "string"
                ? [`${k}:s${n}`, `${k}.string:${n},${k}:${t}`][nan]
                : [`${k}:[${Array(n).fill(t)}]`, `${k}.array:${n},${k}:${t}`][nan];
            y = y.split(x).join(r);
        }
    }

    /* [<n>/<t>], n-size, t-type
     * [<t>, ...]
    */
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

    /* {<t> <v1>,<v2,...}
     * {<v1>:<t>,<v2>:<t>,...}
     */
    m = (y.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) || []);
    for (let x of m) {
        const m = x.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
        if (m !== null && m.length === 3) {
            let [, t, r] = m;
            r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
        }
    }

    y = y.replace(/([}\]])\s*([{\[\w])/g, '$1,$2'); // add missing ',' between }] and {[
    y;

    // Add missing ""
    //y = y.replace(/([_a-zA-Z]\w*[.stringay]*)/g, '"$1"');
    y = y.replace(/([_a-zA-Z]\w*\.?\w*)/g, '"$1"');
    y;

    // Replace base types with user types
    if(Array.isArray(types)) {
        y;
        // replace base with types, stage 1
        types.forEach(([k, v]) => y = y.split(`"${k}"`).join(JSON.stringify(v)));
        // reverse to replace nested types
        types = types.reverse();
        // replace base with reverse types, stage 2
        types.forEach(([k, v]) => y = y.split(`"${k}"`).join(JSON.stringify(v)));
        y;
    }
    y;

    // Add missing {} if missing ;)
    if (/^.+:.+$/.test(y) && !/^{.+:.+}$/.test(y)) {
        y;
        y = `{${y}}`;
        y;
    }
    y;


    y;
    return y;
}

function splitClearBase(base) {
    let x = base.split(/[;\n]/);
    let y = [];
    for (let i = 0; i < x.length; i++) {
        let row = x[i].trim();
        if (!row) continue; // remove empty
        if (/.*\/\/.*/g.test(row)) continue; // remove comments `//`
        y.push(row);
    }
    return y;
}
function parseBase(base) {
    // try { // JSON?
    //     return JSON.parse(base);
    // } catch { throw Error(`Syntax error, '${base}'`);}

    // base = base.replace(/'/g,'"'); // Repair JSON
    try { // JSON?
        let json = base.replace(/'/g,'"'); // Repair JSON
        json = json.replace(/(\w+[\w0-9]*)\s*:/g,'"$1":'); // Repair JSON
        return JSON.parse(json);
    } catch { }
    const tmp = splitClearBase(base);
    let y = {};
    end: {
        for (let x of tmp) {
            if (!x) continue;
            let m, type, r;
            m = x.match(/^(\w+[\w\d]*)\s*(.*)$/);
            if (m !== null && m.length === 3) {
                [, type, r] = m;
                r = r.split(/\s*,\s*/);// ','
            } else {
                m = x.match(/\[(.+)\]/);
                if (m !== null && m.length === 2) {
                    [, r] = m;
                    y = r.split(/\s*,\s*/);// ','
                    break end;
                } else {
                    throw Error(`Syntax error, '${x}'`);
                }
            }
            for (let x of r) {
                if (!x) continue;
                let m = x.match(/^(\w[\w\d]*|)\[(\d+|\w[\w\d]+)\]$/);//x.match(/^([a-zA-Z_]\w*|)\[(\w+)\]$/);
                if (m == null)          // not array
                    y[x] = type;
                else {                  // array
                    let [, k, s] = m;
                    if (k)
                        if (s) {
                            if (Number.isNaN(+s)) {
                                let ltype = type.toLowerCase();
                                if (ltype == 'string') {
                                    y[k + '.string'] = s;
                                    y[k] = 'string';
                                }
                                else {
                                    y[k + '.array'] = s;
                                    y[k] = type;
                                }
                            }
                            else
                                y[k] = Array(+s).fill(type);
                        }
                        else
                            throw Error('Syntax error');
                    else
                        if (s) {
                            y = Array(+s).fill(type);
                            break end;
                        }
                        else
                            throw Error('Syntax error');
                }
            }
        }
    }
    return y;
}

function splitClearTypes(types) {
    let r = '';
    let g = 0;
    let clear = types.split(/\n/g);
    clear = clear.map(r => r.split("//", 1)[0]); // remove comment
    clear = clear.map(r => r.trim());
    clear = clear.filter(r => !!r); // remove empty
    let j = clear.join('');
    let y = j.split('').reduce((y, c) => {
        if (!r && " ;".includes(c)) return y;
        r += c;
        if ("{[".includes(c)) {
            g++;
        } else if ("}]".includes(c)) {
            if (--g == 0) {
                y.push(r.replace(/ *; */g, ';').replace(/ {2,}/g, ' '));
                r = '';
            }
        }
        return y;
    }, [])
    return y;
}

function parseTypes(types) {
    // try { // JSON?
    //     return JSON.parse(types);
    // } catch { throw Error(`Syntax error, '${types}'`);}

    // try { // JSON?
    //     return JSON.parse(types);
    // } catch { }
    // types = types.replace(/'/g,'"'); // Repair JSON
    try { // JSON?
        let json = types.replace(/'/g,'"'); // Repair JSON
        json = json.replace(/(\w+[\w0-9]*)\s*:/g,'"$1":'); // Repair JSON
        return JSON.parse(json);
    } catch { }
    const split = splitClearTypes(types);
    const y = {};
    let ref = null;
    for (const x of split) {
        let m, k, t, b, e;
        m = x.match(/(\w+) +([{\[])(.*)([}\]])/);
        if (m !== null && m.length === 5) {
            [, k, t, b, e] = m; //t={[, e=}]
            if (t === '[') b = `[${b}]`
        } else {
            m = x.match(/(\w+) +(\w+ *.+)/);
            if (m !== null && m.length === 3) {
                [, k, b] = m;
            } else throw Error(`Syntax error, '${x}'`);
        }
        try {
            let p = parseBase(b);
            y[k] = p;
        } catch {
            throw Error(`Syntax error, '${x}'`);
        }
    }
    return y;
}

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
    else if (typeof base === 'object') {
        result = JSON.parse(JSON.stringify(base)); // copy base
    }
    else {
        throw TypeError(`Base struct must be 'object', 'array' or 'string'.`);
    }

    // USER TYPES
    if (typeof types == 'string') {
        types = parseTypes(types);
    }
    else if (typeof types !== 'object' || Array.isArray(types)) {
        throw TypeError(`Base struct must be 'object' or 'string'.`);
    }

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

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} struct*/ // struct $= {}, []
/**@returns {Array.<object, number>}*/ //[readObject, offset]
function readLE(buffer, struct, offset = 0) {
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

/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
/**@returns {Array.<object, number>}*/ //[readObject, offset]
const writeLE = (buffer, struct, object, offset = 0) => {
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

function makeLE(struct, object, trim = true, preAllocSize = 200) {
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
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) {
                    switch (typeof struct[key]) {
                        case 'object': recursion(struct[key], object[key][i]); break;
                        case 'string':
                            let writter = leWritters[struct[key] === 's' ? 's' : struct[key]];
                            if (writter) {
                                let add = struct[key][0] == 's' ? +type.slice(1) : 4;
                                if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
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
                case 'object': recursion(struct[key], object[key]); break;
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
    recursion(struct, object);
    if (trim) buffer = buffer.slice(0, offset);
    return [buffer, offset];
}

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {Object|Array} struct*/ // struct $= {}, []
function readBE(buffer, struct, offset = 0) {
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

/**@returns {Object|Array}*/
/**@param {Buffer} buffer*/
/**@param {Number} offset*/
/**@param {(Object|Array)} struct*/ // struct $= {}, []
/**@param {(Object|Array)} object*/
const writeBE = (buffer, struct, object, offset = 0) => {
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

function makeBE(struct, object, trim = true, preAllocSize = 200) {
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
                    if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
                    writter(object[key].length);
                }
                else throw TypeError(`Unknown type "${typeLength}"`);
                for (let i = 0; i < object[key].length; i++) {
                    switch (typeof struct[key]) {
                        case 'object': recursion(struct[key], object[key][i]); break;
                        case 'string':
                            let writter = beWritters[struct[key] === 's' ? 's' : struct[key]];
                            if (writter) {
                                let add = struct[key][0] == 's' ? +type.slice(1) : 4;
                                if (buffer.length < offset + add) buffer = Buffer.concat([buffer, Buffer.allocUnsafe(Math.max(add, preAllocSize))]);
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
                case 'object': recursion(struct[key], object[key]); break;
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
    recursion(struct, object);
    if (trim) buffer = buffer.slice(0, offset);
    return [buffer, offset];
}

class C_Struct {
    constructor(model, types = {}, preAllocSize = 200) {
        this._offset = 0;
        // PREPROCESOR
        let jstruct = jparser(model, types);
        let struct = parseStruct(model, types);
        this._struct = JSON.stringify(struct);
        this._preAllocSize = preAllocSize;
    }
    get preAllocSize() { return this._preAllocSize; }
    set preAllocSize(v) { this._preAllocSize = v; }
    get offset() { return this._offset; }
    set offset(v) { this._offset = v; }
    // get struct() { return JSON.parse(this._struct); }
    get struct() { return this._struct; }
    readLE(buffer, offset = undefined) {
        buffer;
        if (offset !== undefined) this._offset = offset;
        let [read, offs] = readLE(buffer, this.struct, this._offset);
        this._offset = offs;
        return read;
    }
    writeLE(buffer, object, offset = undefined) {
        if (offset !== undefined) this._offset = offset;
        this.offset = writeLE(buffer, this.struct, object, this._offset);
        return this.offset;
    }
    makeLE(object, trim = true) {
        this._offset = 0;
        let [make, offs] = makeLE(this.struct, object, trim, this._preAllocSize);
        this._offset = offs;
        return make;
    }
    readBE(buffer, offset = undefined) {
        buffer;
        if (offset !== undefined) this._offset = offset;
        let [read, offs] = readBE(buffer, this.struct, this._offset);
        this._offset = offs;
        return read;
    }
    writeBE(buffer, object, offset = undefined) {
        if (offset !== undefined) this._offset = offset;
        this.offset = writeBE(buffer, this.struct, object, this._offset);
        return this.offset;
    }
    makeBE(object, trim = true) {
        this._offset = 0;
        let [make, offs] = makeBE(this.struct, object, trim, this._preAllocSize);
        this._offset = offs;
        return make;
    }
}

module.exports.C_Struct = C_Struct;

module.exports.$test = {
    baseSize,
    jparser,

    splitClearBase,
    parseBase,
    splitClearTypes,
    parseTypes,
    parseStruct,

    readLE,
    writeLE,
    makeLE,

    readBE,
    writeBE,
    makeBE,
};