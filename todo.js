// c_struct

function hex2(buf) {
    return `[${buf.toString('hex').match(/.{2,4}/g)}]`;
}
function hex4(buf) {
    return `[${buf.toString('hex').match(/.{2,8}/g)}]`;
}


