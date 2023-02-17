// c_struct
//TODO:
// dynamic arrays wiyh any kind of length i8..d
// clear code
// add tests
// todo = struct('u8');
// todo = struct('TestType', { TestType: {x:'u8', y:'u16', z:'u32'} });
// todo `{ a: u8 }` impossible/difficult, use 
    //todo ["u8"]=eval(`t=["u8"]`), =eval(`t=${x.replace()}`)
    // "[u8]".replace(/(u(8|16|32)|f|d|s[0-9]+)/g,'"$1"')
    try {
        m = x.replace(/(u(8|16|32)|f|d|s[0-9]+)/g,'"$1"');
        r = eval(`t=${m}`);
        //return JSON.parse(base);
    } catch { }


function hex2(buf) {
    return `[${buf.toString('hex').match(/.{2,4}/g)}]`;
}
function hex4(buf) {
    return `[${buf.toString('hex').match(/.{2,8}/g)}]`;
}

// problemy
model = struct(`
    s3 lower;
    s3 upper;
`,`
    T1 { u8 [3]; };
    A3 [u8,u8,u8];
`);
model = struct(
    `[u8,u8,u8]` ok
);
model = struct(
    `u8[3]` ok
);
types:
`T1 {   u8 [3]; }` ok => `T1: ["u8","u8","u8"]`
`T2 {u8[3]; };` ok => `T2: ["u8","u8","u8"]`
`A3 [u8,u8,u8];` ok
`A3 u8[3]` ok
`T3 u8[3]` ok
`T4 [u8,u32];`ok
`A3 [u8,u8,u8];`ok
`A4 u8[3];`ok


model = struct(`
    s3 lower;
    s3 upper;
`,`
    Pair { f X, Y; }; // comment 6
    // comment 1
    Error   { // comment 5
        s3 err1, err2; // comment 2
    }; // comment 3
    // comment 4
    Abc {
        u8 a;
        u16 b ;
        u32 c,d  ;
    }  ;
    T1 {   u8 [3]; };
    T2 {u8[3]; };
    //A3 [u8,u8,u8]; ok
    //A3 u8[3]; ok
`);

eslint
https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

ts package
https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c
with:
jestconfig.json

