// clear code regex
// `^\s*((?!break|continue)\w+|console\..*);\n` => ``

/**
 * 
 * @param {object|string} model
 * @param {object|string|undefined} types
 * 
 * @returns {object} model
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

// // Object/Array,String approach
// jparser('u8');//?
// jparser(['u8']);//?
// jparser(['u8', 'u8']);//?
// jparser({ a: 'u8', b: 'u8' });//?
// jparser({ a: ['u8', 'u8'] });//?
// jparser({ "a.array": 'f', a: 'f' });//?
// jparser({ "a.string": 'f', a: 'string' });//?
// jparser({ a: 'f' });//?
// jparser({ a: { b: 'f' } });//?
// jparser({ a: 'User' });//?
// jparser({ a: 'User' }, { User: 'u8' });//?
// jparser({ a: 'User' }, { User: ['u8','u16'] });//?
// jparser('User', { User: ['u8','u16'] });//?
// jparser('User', { User: { x: 'f', y: 'f', z: 'f' }});//?
// jparser(['User'], { User: { x: 'f', y: 'f', z: 'f' }});//?
// jparser({ u: 'User' }, { User: { x: 'f', y: 'f', z: 'f' } });//?
// jparser({ u: 'User' }, { User: { nested: 'Ab' }, Ab: { a: 'i64', b: 'i64' } });//?

// // JSON approach
// jparser('u8');//?
// jparser('["u8"]');//?
// jparser('["u8", "u8"]');//?
// jparser('{ a: "u8", b: "u8" }');//?
// jparser('{ a: ["u8", "u8"] }');//?
// jparser('{ "a.array": "f", a: "f" }');//?
// jparser('{ "a.string": "f", a: "string" }');//?
// jparser('{ a: "f" }');//?
// jparser('{ a: { b: "f" } }');//?
// jparser('{ a: "User" }');//?
// jparser('{ a: "User" }', '{ User: "u8" }');//?
// jparser('{ a: "User" }', '{ User: ["u8","u16"] }');//?
// jparser('User', '{ User: ["u8","u16"] }');//?
// jparser('User', '{ User: { x: "f", y: "f", z: "f" }}');//?
// jparser('["User"]', '{ User: { x: "f", y: "f", z: "f" }}');//?
// jparser('{ u: "User" }', '{ User: { x: "f", y: "f", z: "f" } }');//?
// jparser('{ u: "User" }', '{ User: { nested: "Ab" }, Ab: { a: "i64", b: "i64" } }');//?

// // String, C-KIND approach
// jparser('u8');//?
// jparser('[u8]');//?
// jparser('[u8, u8]');//?
// jparser('{ a: u8, b: u8 }');//?
// jparser('{ a: [u8, u8] }');//?
// jparser('{ a: [f/f]}');//?
// jparser('{ a: [f/string]}');//?
// jparser('{ a: f }');//?
// jparser('{ a: { b: f } }');//?
// jparser('{ a: User }');//?
// jparser('{ a: User }', '{ User: u8 }');//?
// jparser('{ a: User }', '{ User: [u8,u16] }');//?
// jparser('User', '{ User: [u8,u16] }');//?
// jparser('User', '{ User: { x: f, y: f, z: f }}');//?
// jparser('[User]', '{ User: { x: f, y: f, z: f }}');//?
// jparser('{ u: User }', '{ User: { x: f, y: f, z: f } }');//?
// jparser('{ u: User }', '{ User: { nested: Ab }, Ab: { a: i64, b: i64 } }');//?
// // //(+)
// jparser('[2/User]', '{ User: { x: f, y: f, z: f }}');//?
// jparser('{f x,y,z;}');//?
// jparser('User', '{ User: { f x,y,z; }}');//?
// jparser('[A,B,C]', '{ A {u8 aa; }, B {u16 bb;}, C [2/u64] }');//?
// jparser(`{u8 a;u16 a,b;}`);//?
// jparser('{octaves:[f/Octave]}','{Octave:{b:[f,f,f],v:[f,f,f]}}');//?
// jparser(`{u16 a,b;}`);//?
// jparser(`{
// u8 a;
// u16 b,c;
// d[2/u8];
// e{f:u64}
// }`);//?
 jparser(`{Pair table[2];}`);//?
// jparser(`{Pair table[u8];}`);//?
// jparser(`{string table[2];}`);//?
// jparser(`{string table[u8];}`);//?
jparser(`u8 [3];`);//?
jparser(`string [3];`);//?