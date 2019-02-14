const { parseStruct, readBufferLE, makeBufferLE, writeBufferLE, } = require('./index');
//module.exports = require('./lib/api')

class C_Struct {
    constructor(base, types) {
        this._offset = 0;
        this._buffer = null;
        this._struct = JSON.stringify(parseStruct(base, types));
    }
    get offset() { return this._offset; }
    set offset(v) { this._offset = v; }
    get buffer() { return this._buffer; }
    //set buffer(v) { this._buffer = v; }
    readLE(buffer, offset = 0) {
        this._buffer = buffer;
        this._offset = offset;
        //
        return {};
    }
    writeLE(buffer, object, offset = 0) {
        this._buffer = buffer;
        this._offset = offset;
        //
        return this.offset;
    }
    makeLE(object, offset = 0) {
        this._buffer = Buffer.alloc(500);
        this._offset = offset;
        //
        return this._buffer;
    }
}


//let m = ' A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};'.match(/[\s\w]*\{[\s\w ,;]*\}\s*;/g);
function struct(base, types = {}) {
    if (typeof types == 'string') {
        let r = types;
        types = {};
        r = r.replace(/\n/g, '');
        console.log(`"${r}"`);
        r;
        let m = r.match(/[\s\w]*\{[\w\d\s,;\[\]]+\}\s*;/g);
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
        types;
    }
    if (typeof base == 'string') {
        let tmp = base;
        base = {};
        console.log(`"${tmp}"`);
        tmp = tmp.split(/;.*\n/);
        tmp;
        end: {
            for (let x of tmp) {
                x = x.trim();
                if (!x) continue;
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
        base;
    }

    base;
    types;

    let model = new C_Struct(base, types);
    return model;
}

//todo
// /[\s\w]*\{[\s\w ,;]*\}\s*;/g
// ' A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};'

//let m = ' A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};'.match(/[\s\w]*\{[\s\w ,;]*\}\s*;/g);
//console.log(m);

let model1 = struct(
    `
    string d[u8];
    `,
    // Xy d[u8];
    // `
    // Xy a, b;
    // u16 h;

    // `,
    `Xy {
        u8 a ,z[3];
    };
    A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};
    `
);
// Xy[5];
model1;


// function struc(strings, ...values) {
//     console.log(strings.raw);
//     console.log(strings);
//     console.log(values);
//     let a = [];
//     let o = {};
//     for (let s of strings) {
//         let d = s.split('\n');
//         d;
//         for (let x of d) {
//             if (!x) continue;
//             x;
//             x = x.replace(/^\s*(.+);$/, '$1');
//             x;
//             let m = x.match(/^(\w[\w\d]*) (.*)$/);
//             m;
//             if (!m) continue;
//             let [, t, r] = m;
//             t;
//             r;
//             r = r.split(/\s*,\s*/);
//             r;
//             for (let k of r) {
//                 let m = k.match(/^(\w[\w\d]*)\[(\d+)\]$/);
//                 if (m == null)
//                     o[k] = t;
//                 else {
//                     let [, n, s] = m;
//                     n;
//                     s;
//                     o[n] = Array(+s).fill(t);
//                 }
//             }
//             o;
//             x;
//             a.push(x);
//         }
//     }
//     a;
//     o;
//     //class Schema
//     return { struct: o };
// }
// let St1 = struc`
//     u8 a[2];
//     u8 b, c;
//     u8 d;`
// let St1 = struc`
//     u8 a[2];`
// let St1 = { struct: { a: ['u8', 'u8'] } };
// St1;
// let St2 = struc`${St1} s;`;
// St2;