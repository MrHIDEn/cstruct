/**
 * 
 * @param {object|string} model
 * @param {object|string|undefined} types
 * 
 * @returns {object} model
 */
function jparser(model, types) {
    model;
    types;
    switch (typeof types) {
        case "string":
            types;
            types = jparser(types);
            types;
            types = JSON.parse(types);
        case "object":
            types;
            console.log(Array.isArray(types)?'[]':'{}');
            types = Object.entries(types);
            console.log(Array.isArray(types)?'[]':'{}');
            console.log(JSON.stringify(types));
            //? .reduce((y, [k, v]) => Object.assign(y, { [k]: JSON.stringify(v) }), {});
            break;
    }
    let y = (typeof model === 'string') ? model : JSON.stringify(model);
    y = y.replace(/\/\/.*$/gm, ``); // remove comments
    y;
    y = y.replace(/^\s+$/m, ``); // remove empty lines
    y = y.replace(/\s{2,}/g, ` `); // reduce ' ' to one ' '
    y = y.replace(/\n/g, ``); // remove line breaks
    y;
    y = y.replace(/\s*,\s*/g, `,`); //x remove spaces before/after ,
    y = y.replace(/\s*([}\]])\s*;?\s*/g, `$1`); // remove ending ; for } or ] and trim ' ' on start and ' '
    y = y.replace(/([{\[])\s*(\w)/g, `$1$2`); // remove spaces after { or [
    y;
    y = y.replace(/([}\]])\s*(\w+)/g, `$1,$2`); // add , between keys
    y = y.replace(/([\w0-9])\s*:?\s*([{\[])/g, `$1:$2`); // add missing : between key and { or [ and remove ' ' around :
    y = y.replace(/\s*:\s*/g, ':'); // remove spaces around :
    y;
    y = y.replace(/\"/g, ''); // remove all "

    //todo: if /regex// and {}
    //done: test
    y = y.replace(/[^{]([_a-zA-Z]\w*\s+[\w0-9,]+);/g, '{$1;}'); // close objects
    y;
    let m;

    m = (y.match(/[}\]]\s*[{\[]/g) || []);//?
    //y = y.replace(/([}\]])\s*([{\[])/g, '$1,$2'); // add missing ',' between }] and {[
    y;
    m = (y.match(/[}\]]\s*[{\[]/g) || []);//?

    /** Special: a[u8/u8],a[3/u8],a[u8/string],a[3/string]
     * A) array, <k>:[<n>/<t>], k-key, n-size, t-type
     * A1 <k>:[<t>, ...], when <n> is number
     * A2 <k>.array:<s>,<k>:<t>, when <n> is string (u8, ect)
     * S) string, <k>:[<s>/string], k-key, n-size, string
     * S1 <k>:s<n>, when <n> is number
     * S2 <k>.string:u8,<k>:string, when <n> is string (u8, ect)
     */
    m = (y.match(/\w+:\[\w+\/\w+=?\w*\]/g) || []);
    m;
    for(let x of m) {
        x;
        const m = x.match(/(\w+):\[(\w+)\/(\w+)\]/);
        m;
        if (m !== null && m.length === 4) {
            let [, k, n, t] = m;
            n = +n || n;
            k;
            t;
            n;
            let nan = +Number.isNaN(+n);//?
            let r = t === "string"
                ? [`${k}:s${n}`, `${k}.string:${n},${k}:${t}`][nan]
                : [`${k}:[${Array(n).fill(t)}]`, `${k}.array:${n},${k}:${t}`][nan];
            r;
            y = y.split(x).join(r);
            y;
        }
    }
    y;

    // [<n>/<t>], n-size, t-type
    // [<t>, ...]
    m = (y.match(/\[\w+\/\w+=?\w*\]/g) || []);
    m;
    for(let x of m) {
        x;
        const m = x.match(/\[(\w+)\/(\w+)\]/);
        m;
        if (m !== null && m.length === 3) {
            let [, n, t] = m;
            n = +n || -1;
            n;
            t;
            if (n>=0) {
                let r = `[${Array(n).fill(t)}]`;
                y = y.split(x).join(r);
                y;
            } else { 
                throw Error("Syntax error"); 
            }
        }
    }
    y;

    // {<t> <v1>,<v2,...}
    // {<v1>:<t>,<v2>:<t>,...}
    m = (y.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) || []);
    m;
    for (let x of m) {
        const m = x.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
        m;
        if (m !== null && m.length === 3) {
            let [, t, r] = m;
            t;
            r;
            x;
            y;
            r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
            y;
        }
    }
    y;

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

    // Add missing {}
    if (/^.+:.+$/.test(y) && !(/^{.+:.+}$/.test(y) || /^\[.+:.+\]$/.test(y))) {
        y;
        y = `{${y}}`;
        y;
    }
    // Add missing []
    else if (/^.+,.+$/.test(y) && !(/^{.+,.+}$/.test(y) || /^\[.+,.+\]$/.test(y))) {
        y;
        y = `[${y}]`;
        y;
    }
    y;

    console.log("Y:", y);
    return y;
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

// // C-KIND approach
// jparser('u8');//?
// jparser('[u8]');//?
// jparser('[u8, u8]');//?
// jparser('{ a: 8, b: u8 }');//?
// jparser('{ a: [u8, u8] }');//?
// jparser('{ a: [f/f]');//?
// jparser('{ a: [f/string]');//?
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
// (+)
//jparser('{f x,y,z;}');//?
//jparser('User', '{ User: { f x,y,z; }}');//?
jparser('A,B,C', '{ A {u8 aa; }, B {u16 bb;}, C [2/u64] }');//?

// {} []
// jparser(`{
// u8 a;
// u16 a,b;
// a[2/u8];
// b{c:f}
// }`);//?




//jparser('{octave11:[f/Octave]}');//?
// jparser('{octave11:[f/Octave]}','{Octave:{b:[f,f,f],v:[f,f,f]}}');//?
//jparser('Aaa','{Aaa:[Bbb],Bbb:[Ccc,Ccc],Ccc:{d:u8}}');//?
// jparser('Aaa','{Ccc:{d:u8},Bbb:[Ccc,Ccc],Aaa:[Bbb]}');//?
//jparser('Aaa','{Aaa:[Bbb],Ccc:{d:u8},Bbb:[Ccc,Ccc]}');//?
// be careful
// {Aaa:Bbb, Bbb:Aaa}
// {Aaa:[Bbb,Bbb], Bbb:Aaa}
// nawet nie az tak zle
//jparser('Aaa','{Aaa:[Bbb,Bbb], Bbb:{a:u8,b:Aaa}}');//?

// jparser('u8');//?
// jparser('[u8]');//?
// jparser('[u8,u8]');//?
// jparser('[2/u8]');//?
// // jparser('[u8/u8]');//ERROR//?
// jparser('a[2/u8]');//?
// jparser('{a[2/u8]}');//?
// jparser('a[u8/u8]');//?
// jparser('a[2/string]');//?
// jparser('a[u8/string]');//?
// //jparser('[u8/string]');//ERROR//?
// jparser('a:u8');//?
// jparser('a:u8');//?

// jparser('u8 a;');//?
// jparser('u8 a,b;');//?
// jparser(`{
// u8 a;
// u16 a,b;
// a[2/u8];
// b{c:f}
// }`);//?
// jparser('a:u8');//?
// jparser('{a:u8}');//?