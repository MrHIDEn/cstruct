### DRAFT
```javascript
const struct = require('c_struct');

// let model = struct(base, types);
let model1 = struct(`
    Xyz path[5];`,
    `Xyz {
        f x, y, z;
    };`);
let model2 = struct(
    { path : ['Xyz','Xyz','Xyz','Xyz','Xyz'] },
    { Xyz: { x:'f', y:'f', z:'f' } });
let model3 = struct(`
    Xyz[5];`,
    `Xyz {
        f x, y, z;
    };`);
let model4 = struct(
    ['Xyz','Xyz','Xyz','Xyz','Xyz'],
    { Xyz: { x:'f', y:'f', z:'f' } });

// let obj1 = model1.readLE(buffer);
let obj1 = model1.readLE(buffer, offset);
model1.offset = 16;
let offset = model1.offset;

// let offset = model1.writeLE(object);
let offset = model1.writeLE(buffer, object, offset);


let buffer = model1.makeLE(object, offset);


class C_Struct {
    constructor(base, types) {
        this.offset = 0;
        this.buffer = null;
    }
    get offset(){return this.offset;}
    set offset(v){ this.offset = v;}
    readLE(buffer, offset=0){
        this.buffer=buffer;
        this.offset=offset;
        //
        return {};
    }
    writeLE(buffer, object, offset=0) {
        this.buffer=buffer;
        this.offset=offset;
        //
        return this.offset;
    }
    makeLE(object, offset=0) {
        this.buffer=Buffer.alloc(500);
        this.offset=offset;
        //
        return this.buffer;
    }
}

```