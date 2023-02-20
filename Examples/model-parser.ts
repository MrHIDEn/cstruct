import { ModelParser } from "../src/model-parser";

// Object/Array,String approach
ModelParser.parseModel('u8');//?
ModelParser.parseModel(['u8']);//?
ModelParser.parseModel(['u8', 'u8']);//?
ModelParser.parseModel({ a: 'u8', b: 'u8' });//?
ModelParser.parseModel({ a: ['u8', 'u8'] });//?
ModelParser.parseModel({ "a.array": 'f', a: 'f' });//?
ModelParser.parseModel({ "a.string": 'f', a: 'string' });//?
ModelParser.parseModel({ a: 'f' });//?
ModelParser.parseModel({ a: { b: 'f' } });//?
ModelParser.parseModel({ a: 'User' });//?
ModelParser.parseModel({ a: 'User' }, { User: 'u8' });//?
ModelParser.parseModel({ a: 'User' }, { User: ['u8','u16'] });//?
ModelParser.parseModel('User', { User: ['u8','u16'] });//?
ModelParser.parseModel('User', { User: { x: 'f', y: 'f', z: 'f' }});//?
ModelParser.parseModel(['User'], { User: { x: 'f', y: 'f', z: 'f' }});//?
ModelParser.parseModel({ u: 'User' }, { User: { x: 'f', y: 'f', z: 'f' } });//?
ModelParser.parseModel({ u: 'User' }, { User: { nested: 'Ab' }, Ab: { a: 'i64', b: 'i64' } });//?

// JSON approach
ModelParser.parseModel('u8');//?
ModelParser.parseModel('["u8"]');//?
ModelParser.parseModel('["u8", "u8"]');//?
ModelParser.parseModel('{ a: "u8", b: "u8" }');//?
ModelParser.parseModel('{ a: ["u8", "u8"] }');//?
ModelParser.parseModel('{ "a.array": "f", a: "f" }');//?
ModelParser.parseModel('{ "a.string": "f", a: "string" }');//?
ModelParser.parseModel('{ a: "f" }');//?
ModelParser.parseModel('{ a: { b: "f" } }');//?
ModelParser.parseModel('{ a: "User" }');//?
ModelParser.parseModel('{ a: "User" }', '{ User: "u8" }');//?
ModelParser.parseModel('{ a: "User" }', '{ User: ["u8","u16"] }');//?
ModelParser.parseModel('User', '{ User: ["u8","u16"] }');//?
ModelParser.parseModel('User', '{ User: { x: "f", y: "f", z: "f" }}');//?
ModelParser.parseModel('["User"]', '{ User: { x: "f", y: "f", z: "f" }}');//?
ModelParser.parseModel('{ u: "User" }', '{ User: { x: "f", y: "f", z: "f" } }');//?
ModelParser.parseModel('{ u: "User" }', '{ User: { nested: "Ab" }, Ab: { a: "i64", b: "i64" } }');//?

// String, C-KIND approach
ModelParser.parseModel('u8');//?
ModelParser.parseModel('[u8]');//?
ModelParser.parseModel('[u8, u8]');//?
ModelParser.parseModel('{ a: 8, b: u8 }');//?
ModelParser.parseModel('{ a: [u8, u8] }');//?
ModelParser.parseModel('{ a: [f/f] }');//?
ModelParser.parseModel('{ a: [f/string] }');//?
ModelParser.parseModel('{ a: f }');//?
ModelParser.parseModel('{ a: { b: f } }');//?
ModelParser.parseModel('{ a: User }');//?
ModelParser.parseModel('{ a: User }', '{ User: u8 }');//?
ModelParser.parseModel('{ a: User }', '{ User: [u8,u16] }');//?
ModelParser.parseModel('User', '{ User: [u8,u16] }');//?
ModelParser.parseModel('User', '{ User: { x: f, y: f, z: f }}');//?
ModelParser.parseModel('[User]', '{ User: { x: f, y: f, z: f }}');//?
ModelParser.parseModel('{ u: User }', '{ User: { x: f, y: f, z: f } }');//?
ModelParser.parseModel('{ u: User }', '{ User: { nested: Ab }, Ab: { a: i64, b: i64 } }');//?
//(+)
ModelParser.parseModel('[2/User]', '{ User: { x: f, y: f, z: f }}');//?
ModelParser.parseModel('{f x,y,z;}');//?
ModelParser.parseModel('User', '{ User: { f x,y,z; }}');//?
ModelParser.parseModel('[A,B,C]', '{ A {u8 aa; }, B {u16 bb;}, C [2/u64] }');//?
ModelParser.parseModel(`{u8 a;u16 a,b;}`);//?
ModelParser.parseModel('{octaves:[f/Octave]}','{Octave:{b:[f,f,f],v:[f,f,f]}}');//?
ModelParser.parseModel(`{u16 a,b;}`);//?
ModelParser.parseModel(`{
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
