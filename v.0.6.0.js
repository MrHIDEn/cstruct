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
        let tmp = types;
        types = {};
        tmp = tmp.replace(/\n/g, '');
        tmp;
        tmp = tmp.replace(/\}\s*;/g, '\n').split('\n');
        tmp;
        for (let x of tmp) {
            if (!x) continue;
            x = x.trim();
            x;
            let m = x.match(/^(\w[\w\d]*)\s*\{\s*(.*;)$/);//array? Xy [ u8, u8 ], niee
            let [, type, r] = m;
            r = r.split(';');
            type;
            r;
            types[type] = {};
            for (let x of r) {
                if (!x) continue;
                console.log(types[type]);
                console.log([x]);
                //todo cos nie trybi
                x;
                //r = r.split(/\s*,\s*/);
                let m = x.match(/^\s*(\w[\w\d]*) (.*)$/);
                m;
                if (!m) continue;
                let [, t, r] = m;
                t;
                r;
                r = r.split(/\s*,\s*/);// ','
                r;
                //todo
                for (let x of r) {
                    x;
                    console.log(types[type]);
                    let m = x.match(/^(\w[\w\d]*)\[(\d+)\]$/);
                    if (m == null)
                        types[type][x] = t;
                    else {
                        let [, n, s] = m;
                        n;
                        s;
                        types[type][n] = Array(+s).fill(t);
                    }
                    console.log(types[type]);
                }
                console.log(types[type]);
            }

            //types[type] = r;
        }
        types;
    }

    if (typeof base == 'string') {
        let tmp = base;
        base = {};
        console.log(`"${tmp}"`);
        tmp = tmp.split(/;.*\n/);
        tmp;
        for (let x of tmp) {
            x = x.trim();
            if (!x) continue;
            console.log(`"${x}"`);
            let m = x.match(/^(\w[\w\d]*)\s*(.*)$/);
            m;
            let [, type, r] = m;
            console.log(`"${type}"`);
            console.log(`"${r}"`);   
            r = r.split(/\s*,\s*/);// ','
            for (let x of r) {
                if (!x) continue;
                console.log(`"${x}"`);
                console.log(`"${type}"`);
                base[x] = type;
                //console.log(`"${base[x]}"`);  

   
                //r = r.split(/\s*,\s*/);// ','
                //r;
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
    Xy a, b;
    u16 h;

    `,
    `Xy {
        u8 z[3];
    };`
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