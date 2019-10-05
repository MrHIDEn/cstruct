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
        case "object":
            types = Object.entries(JSON.parse(types));
            break;
    }
    let y = model;
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
    let m = (y.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) || []);
    for (let x of m) {
        let m = x.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
        if (m !== null && m.length === 3) {
            let [, t, r] = m;
            r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
            y = y.split(x).join(r);
        }
    }
    y = y.replace(/([_a-zA-Z]\w*)/g, '"$1"');
    if(typeof types === 'object') {
        types.forEach(([k,v]) => y = y.split(`"${k}"`).join(JSON.stringify(v)));
    }
    y;
    return y;
}

let model = parser(`//model
{
    "aa1" : {a:Efg}  // comment 2
    // bb2 { //comment 3
    //     u8 a,b,c;//comment 4
    // }
    // cc3 [
    //     u8,u8//comment5
    // ]
    dd4 {
        f x , y , z;
    }
    ee5[Abc, Abc]
}`, `//types
{
Abc{u16 a,b,c;}
Efg[u16,u16,u16]
}`);

model;
let j = JSON.parse(model);
j;
j;//? $.aa1
j;//? $.bb2
j;//? $.cc3
j;//? $.dd4
j;//? $.ee5

j=JSON.parse(parser(`
u32
`));
j;