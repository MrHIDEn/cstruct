// c_struct
//TODO:
// clear code
// add tests
// add A { u8 a[u8]; };
// add S { string s[u8]; };

function hex2(buf) {
    return `[${buf.toString('hex').match(/.{2,4}/g)}]`;
}
function hex4(buf) {
    return `[${buf.toString('hex').match(/.{2,8}/g)}]`;
}


