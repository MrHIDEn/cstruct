

b = Buffer.from('402670A3D70A3D71'+'0000000000000000','hex');//?
b.toString('hex').match(/.{2,16}/g).join(' ');//?
a = new ArrayBuffer(b);
u = new Uint8Array(b);
dv = new DataView(u.buffer,0,16);
//dv = new DataView(a,0,16);
dv.getFloat64(0);//?
dv.getFloat64(8);//?
dv.setFloat64(8, 33.44);
dv.getFloat64(8);//?
b.toString('hex').match(/.{2,16}/g).join(' ');//?
c = Buffer.from(dv.buffer);
c.toString('hex').match(/.{2,16}/g).join(' ');//?

// Creating buffer with size in byte 
var buffer = new ArrayBuffer(20);//?
  
// Creating a view 
var dataview1 = new DataView(buffer, 0, 10); 

// put the data 56.34 at slot 1 
dataview1.setFloat64(1, 56.34); 
dataview1.getFloat64(1);//?