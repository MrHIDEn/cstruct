// c_struct
//TODO:
// clear code
// add tests
// add parseBase `[u8,u16,u32]` = ['u8','u16','u32']


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
`[u8,u8,u8]` error
model = struct(
    `[u8,u8,u8]` error
);
model = struct(
    `u8[3]` ok
);
types:
`T1 {   u8 [3]; }` ok => `T1: ["u8","u8","u8"]`
`T2 {u8[3]; };` ok => `T2: ["u8","u8","u8"]`
`A3 [u8,u8,u8];` error
`A3 u8[3]` error
`T3 u8[3]` ok
// add parseBase `[u8,u16,u32]` = ['u8','u16','u32']
`T4 [u8,u16];` error TODO:


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
    //A3 [u8,u8,u8]; error
    //A3 u8[3]; error
`);


