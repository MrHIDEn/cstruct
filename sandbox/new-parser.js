/**
 * 
 * @param {object|string} model
 * @param {object|string|undefined} types
 * 
 * @returns {object} model
 */
function parser(model, types) {
    switch (typeof types) {
        case "string":
            types = parser(types);
            types = JSON.parse(types);
        case "object":
            types;
            console.log(typeof types);
            types = Object.entries(types);
            types;//?
            //? .reduce((y, [k, v]) => Object.assign(y, { [k]: JSON.stringify(v) }), {});
            break;
    }
    let y = (typeof model === 'string') ? model : JSON.stringify(model);
    y = y.replace(/\/\/.*$/gm, ``); // remove comments
    y;
    y = y.replace(/\s+/m, ``); // remove empty lines
    y = y.replace(/\s{2,}/g, ` `); // reduce ' ' to one ' '
    y = y.replace(/\n/g, ``); // remove line breaks
    //?y = y.replace(/^(["\w].*)$/, `{$1}`); // add {} if missing {} or []
    y = y.replace(/\s*,\s*/g, `,`); //x remove spaces before/after ,
    y = y.replace(/\s*([}\]])\s*;?\s*/g, `$1`); // remove ending ; for } or ] and trim ' ' on start and ' '
    y = y.replace(/([{\[])\s*(\w)/g, `$1$2`); // remove spaces after { or [
    y = y.replace(/([}\]])\s*(\w+)/g, `$1,$2`); // add , between keys
    y = y.replace(/([\w0-9])\s*:?\s*([{\[])/g, `$1:$2`); // add missing : between key and { or [ and remove ' ' around :
    y = y.replace(/\s*:\s*/g, ':'); // remove spaces around :
    y = y.replace(/\"/g, ''); // remove all "
    y;
    let m;

    m = (y.match(/\w+:\[\w+\/\w+=?\w*\]/g) || []);
    m;
    for(let x of m) {
        x;
        const m = x.match(/(\w+):\[(\w+)\/(\w+)\]/);
        m;
        if (m !== null && m.length === 4) {
            let [, k, s, t] = m;
            let n = +s || -1;
            k;
            s;
            t;
            n;
            let r;
            r = n >= 0 
                ? `${k}:[${Array(n).fill(t)}]` 
                : `${k}.array:${s},${k}:${t}`;
            r;
            //r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
            y;
        }
    }
    y;

    m = (y.match(/\[\w+\/\w+=?\w*\]/g) || []);
    m;
    for(let x of m) {
        x;
        const m = x.match(/\[(\w+)\/(\w+)\]/);
        m;
        if (m !== null && m.length === 3) {
            let [, s, t] = m;
            let n = +s || -1;
            s;
            t;
            n;
            let r;
            r = n >= 0 
                ? `[${Array(n).fill(t)}]` 
                : `xxx`;
            r;
            //r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
            y;
        }
    }
    y;

    m = (y.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) || []);
    for (let x of m) {
        const m = x.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
        m;
        if (m !== null && m.length === 3) {
            let [, t, r] = m;
            r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
        }
    }
    y;
    y = y.replace(/([_a-zA-Z]\w*)/g, '"$1"');
    if(typeof types === 'object') {
        types.forEach(([k,v]) => y = y.split(`"${k}"`).join(JSON.stringify(v)));
    }
    y;
    return y;
}
parser('a[u8/u32]');//?
// let model = parser(`//model
// {
//     "aa1" : {a:Efg}  // comment 2
//     // bb2 { //comment 3
//     //     u8 a,b,c;//comment 4
//     // }
//     // cc3 [
//     //     u8,u8//comment5
//     // ]
//     dd4 {
//         f x , y , z;
//     }
//     ee5[Abc, Abc]
// }`, `//types
// {
// Abc{u16 a,b,c;}
// Efg[u16,u16,u16]
// }`);

// model;
// let j = JSON.parse(model);
// j;
// j;//? $.aa1
// j;//? $.bb2
// j;//? $.cc3
// j;//? $.dd4
// j;//? $.ee5

// j=JSON.parse(parser(`
// u32
// `));
// j;

//parser(['Xyz','Xyz'],{Xyz:['u8','u8','u8']});//?
//parser('Xyz',{Xyz:['u8','u8','u8']});//?
//parser('a [u8/u8]');//?
//parser('[u8/u32]');//?


/*
a typ[len]
a [len.typ]
a [len/typ]
a [len*typ]
a [len;typ]
"a.array":len, "a":typ
{a:[u16]}
        { 'a.array': 'u16', a: 'XYZ' },
        { XYZ: { x: 'd', y: 'd', z: 'd' } },
*/