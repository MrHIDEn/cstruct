const { jparser } = require('../c_struct').$test;
const struct = require('./../index');

// Object/Array,String approach
jparser('u8');//?
jparser(['u8']);//?
jparser(['u8', 'u8']);//?
jparser({ a: 'u8', b: 'u8' });//?
jparser({ a: ['u8', 'u8'] });//?
jparser({ "a.array": 'f', a: 'f' });//?
jparser({ "a.string": 'f', a: 'string' });//?
jparser({ a: 'f' });//?
jparser({ a: { b: 'f' } });//?
jparser({ a: 'User' });//?
jparser({ a: 'User' }, { User: 'u8' });//?
jparser({ a: 'User' }, { User: ['u8','u16'] });//?
jparser('User', { User: ['u8','u16'] });//?
jparser('User', { User: { x: 'f', y: 'f', z: 'f' }});//?
jparser(['User'], { User: { x: 'f', y: 'f', z: 'f' }});//?
jparser({ u: 'User' }, { User: { x: 'f', y: 'f', z: 'f' } });//?
jparser({ u: 'User' }, { User: { nested: 'Ab' }, Ab: { a: 'i64', b: 'i64' } });//?

// JSON approach
jparser('u8');//?
jparser('["u8"]');//?
jparser('["u8", "u8"]');//?
jparser('{ a: "u8", b: "u8" }');//?
jparser('{ a: ["u8", "u8"] }');//?
jparser('{ "a.array": "f", a: "f" }');//?
jparser('{ "a.string": "f", a: "string" }');//?
jparser('{ a: "f" }');//?
jparser('{ a: { b: "f" } }');//?
jparser('{ a: "User" }');//?
jparser('{ a: "User" }', '{ User: "u8" }');//?
jparser('{ a: "User" }', '{ User: ["u8","u16"] }');//?
jparser('User', '{ User: ["u8","u16"] }');//?
jparser('User', '{ User: { x: "f", y: "f", z: "f" }}');//?
jparser('["User"]', '{ User: { x: "f", y: "f", z: "f" }}');//?
jparser('{ u: "User" }', '{ User: { x: "f", y: "f", z: "f" } }');//?
jparser('{ u: "User" }', '{ User: { nested: "Ab" }, Ab: { a: "i64", b: "i64" } }');//?

// String, C-KIND approach
jparser('u8');//?
jparser('[u8]');//?
jparser('[u8, u8]');//?
jparser('{ a: 8, b: u8 }');//?
jparser('{ a: [u8, u8] }');//?
jparser('{ a: [f/f] }');//?
jparser('{ a: [f/string] }');//?
jparser('{ a: f }');//?
jparser('{ a: { b: f } }');//?
jparser('{ a: User }');//?
jparser('{ a: User }', '{ User: u8 }');//?
jparser('{ a: User }', '{ User: [u8,u16] }');//?
jparser('User', '{ User: [u8,u16] }');//?
jparser('User', '{ User: { x: f, y: f, z: f }}');//?
jparser('[User]', '{ User: { x: f, y: f, z: f }}');//?
jparser('{ u: User }', '{ User: { x: f, y: f, z: f } }');//?
jparser('{ u: User }', '{ User: { nested: Ab }, Ab: { a: i64, b: i64 } }');//?
//(+)
jparser('[2/User]', '{ User: { x: f, y: f, z: f }}');//?
jparser('{f x,y,z;}');//?
jparser('User', '{ User: { f x,y,z; }}');//?
jparser('[A,B,C]', '{ A {u8 aa; }, B {u16 bb;}, C [2/u64] }');//?
jparser(`{u8 a;u16 a,b;}`);//?
jparser('{octaves:[f/Octave]}','{Octave:{b:[f,f,f],v:[f,f,f]}}');//?
jparser(`{u16 a,b;}`);//?
jparser(`{
u8 a;
u16 b,c;
d[2/u8];
e{f:u64}
}`);//?
