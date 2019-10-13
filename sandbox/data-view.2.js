

buffer = Buffer.from(`
402670A3D70A3D71
0000000000000000
713D0AD7A3702640
`.replace(/\s*/g,''),'hex');//?
buffer.toString('hex').match(/.{2,16}/g).join(' ');//?

offset = 8*0;
data = { buffer, offset };

function readDouble64(data) {
    let b = data.buffer.slice(data.offset, data.offset += 8);
    let u = Uint8Array.from(b);
    let dv = new DataView(u.buffer, 0, 8);
    let d = dv.getFloat64(0);//?

    Buffer.from(dv.buffer).toString('hex').match(/.{2,16}/g).join(' ');//?
    return d;
}
readDouble64(data);//?



// t = Uint8Array.from(b);
// Buffer.from(t).toString('hex').match(/.{2,16}/g).join(' ');//?
// u = new Uint8Array(b);
// u.toString();//?
// dv = new DataView(u.buffer,0,16);
// //dv = new DataView(a,0,16);
// dv.getFloat64(0);//?
// dv.getFloat64(8);//?
// dv.setFloat64(8, 33.44);
// dv.getFloat64(8);//?
// b.toString('hex').match(/.{2,16}/g).join(' ');//?
// c = Buffer.from(dv.buffer);
// c.toString('hex').match(/.{2,16}/g).join(' ');//?
