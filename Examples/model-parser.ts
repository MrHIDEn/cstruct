import { ModelParser } from "../src/model-parser";

// Object/Array,String approach
ModelParser.parse('u8');//?
ModelParser.parse(['u8']);//?
ModelParser.parse(['u8', 'u8']);//?
ModelParser.parse({ a: 'u8', b: 'u8' });//?
ModelParser.parse({ a: ['u8', 'u8'] });//?
ModelParser.parse({ "a.array": 'f', a: 'f' });//?
ModelParser.parse({ "a.string": 'f', a: 'string' });//?
ModelParser.parse({ a: 'f' });//?
ModelParser.parse({ a: { b: 'f' } });//?
ModelParser.parse({ a: 'User' });//?
ModelParser.parse({ a: 'User' }, { User: 'u8' });//?
ModelParser.parse({ a: 'User' }, { User: ['u8','u16'] });//?
ModelParser.parse('User', { User: ['u8','u16'] });//?
ModelParser.parse('User', { User: { x: 'f', y: 'f', z: 'f' }});//?
ModelParser.parse(['User'], { User: { x: 'f', y: 'f', z: 'f' }});//?
ModelParser.parse({ u: 'User' }, { User: { x: 'f', y: 'f', z: 'f' } });//?
ModelParser.parse({ u: 'User' }, { User: { nested: 'Ab' }, Ab: { a: 'i64', b: 'i64' } });//?

// JSON approach
ModelParser.parse('u8');//?
ModelParser.parse('["u8"]');//?
ModelParser.parse('["u8", "u8"]');//?
ModelParser.parse('{ a: "u8", b: "u8" }');//?
ModelParser.parse('{ a: ["u8", "u8"] }');//?
ModelParser.parse('{ "a.array": "f", a: "f" }');//?
ModelParser.parse('{ "a.string": "f", a: "string" }');//?
ModelParser.parse('{ a: "f" }');//?
ModelParser.parse('{ a: { b: "f" } }');//?
ModelParser.parse('{ a: "User" }');//?
ModelParser.parse('{ a: "User" }', '{ User: "u8" }');//?
ModelParser.parse('{ a: "User" }', '{ User: ["u8","u16"] }');//?
ModelParser.parse('User', '{ User: ["u8","u16"] }');//?
ModelParser.parse('User', '{ User: { x: "f", y: "f", z: "f" }}');//?
ModelParser.parse('["User"]', '{ User: { x: "f", y: "f", z: "f" }}');//?
ModelParser.parse('{ u: "User" }', '{ User: { x: "f", y: "f", z: "f" } }');//?
ModelParser.parse('{ u: "User" }', '{ User: { nested: "Ab" }, Ab: { a: "i64", b: "i64" } }');//?

// String, C-KIND approach
ModelParser.parse('u8');//?
ModelParser.parse('[u8]');//?
ModelParser.parse('[u8, u8]');//?
ModelParser.parse('{ a: 8, b: u8 }');//?
ModelParser.parse('{ a: [u8, u8] }');//?
ModelParser.parse('{ a: [f/f] }');//?
ModelParser.parse('{ a: [f/string] }');//?
ModelParser.parse('{ a: f }');//?
ModelParser.parse('{ a: { b: f } }');//?
ModelParser.parse('{ a: User }');//?
ModelParser.parse('{ a: User }', '{ User: u8 }');//?
ModelParser.parse('{ a: User }', '{ User: [u8,u16] }');//?
ModelParser.parse('User', '{ User: [u8,u16] }');//?
ModelParser.parse('User', '{ User: { x: f, y: f, z: f }}');//?
ModelParser.parse('[User]', '{ User: { x: f, y: f, z: f }}');//?
ModelParser.parse('{ u: User }', '{ User: { x: f, y: f, z: f } }');//?
ModelParser.parse('{ u: User }', '{ User: { nested: Ab }, Ab: { a: i64, b: i64 } }');//?
//(+)
ModelParser.parse('[2/User]', '{ User: { x: f, y: f, z: f }}');//?
ModelParser.parse('{f x,y,z;}');//?
ModelParser.parse('User', '{ User: { f x,y,z; }}');//?
ModelParser.parse('[A,B,C]', '{ A {u8 aa; }, B {u16 bb;}, C [2/u64] }');//?
ModelParser.parse(`{u8 a;u16 a,b;}`);//?
ModelParser.parse('{octaves:[f/Octave]}','{Octave:{b:[f,f,f],v:[f,f,f]}}');//?
ModelParser.parse(`{u16 a,b;}`);//?
ModelParser.parse(`{
u8 a;
u16 b,c;
d[2/u8];
e{f:u64}
}`);//?


// ModelParser._parseTypes({ User: "u8" });//?
// ModelParser._parseTypes('{ User: "u8" }');//?
// ModelParser.parse({ a: "User" }, { User: "u8" });//?
// ModelParser.parse('{ a: "User" }', '{ User: "u8" }');//?
// ModelParser.parse('{ a: [f/f] }');//?
// ModelParser.parse('[2/u8]');//?
// ModelParser.parse('[u8, u8]');//?
// ModelParser.parse('{a[3/u8]}');//?
