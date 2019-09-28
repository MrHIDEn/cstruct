const { struct } = require('../index');
let model, buffer, readBE, readLE, writeBE, writeLE, offset;

/**
 * Read/try `examples\simple-numbers.js` first to get general idea of using this library
 * This examples focus on the strings and read.try numbers first
 * 
 * Atom type is:
 * sX - string X size, [sX:XB], 'utf-8'
 * Strings are endian-less, and if you read/write only strings BE/LE functions will result the same
 * This type has constant length
 * "\0" trims string, s7 = "abc\0cut" becomes "abc"
 * 
 */

 /** Read */
buffer = Buffer.from("aBc");

model = struct(['s1']);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// ["a"]

model = struct(['s1', 's2']);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// ["a","Bc"]

buffer = Buffer.concat([Buffer.from("Some error\0XXXX"), Buffer.from([7])]);

model = struct({ message:'s15', code:'u8' });
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"message":"Some error","code":7}


/** Write */
buffer = Buffer.from(`
cc cc cc cc cc
cc cc cc cc cc
`.replace(/[ ,\n]+/g, ''), 'hex'); // 10B

/** String is shorter than 5, rest is filled with "\0" */
model = struct({ msg: 's5'});
offset = model.writeBE(buffer, { msg: "123" });
console.log(buffer.toString('hex').match(/.{2,10}/g).join(' '));
// 3132330000 cccccccccc

buffer = Buffer.from(`
cc cc cc cc cc
cc cc cc cc cc
`.replace(/[ ,\n]+/g, ''), 'hex'); // 10B

/** String is longer than 5, string is trimed to 5 chars */
model = struct({ msg: 's5'});
offset = model.writeBE(buffer, { msg: "1234567890" });
console.log(buffer.toString('hex').match(/.{2,10}/g).join(' '));
// 3132333435 cccccccccc

/** Make */
buffer = null;
model = struct({ print: ['LCD', 'LCD'] }, { "LCD": { line: 'u8', text: 's4' } });
buffer = model.makeBE({ 
    print: [
        { text: "1st ", line: 1 },
        { text: "2nd ", line: 2 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,10}/g).join(' '));
// 0131737420 02326e6420
/**
 * Notice above that model objects order is significant, but keys in data object are insigificant besides arrays, of course
 * 
 * That's all for this file
 * 
 */
