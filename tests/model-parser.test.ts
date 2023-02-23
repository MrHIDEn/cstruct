import { ModelParser } from "../src/tests";

describe('ModelParser', () => {
    describe('parseTypes', () => {
        describe('types as object', () => {
            it('should parse a simple type 1', () => {
                const types = ModelParser.parseTypes({Some: 'u8'});
                const expected = JSON.stringify({Some: 'u8'});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 2', () => {
                const types = ModelParser.parseTypes({Some: ['u8', 'u16']});
                const expected = JSON.stringify({Some: ['u8', 'u16']});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 3', () => {
                const types = ModelParser.parseTypes({CNC: {x: 'f', y: 'f', z: 'f'}});
                const expected = JSON.stringify({CNC: {x: 'f', y: 'f', z: 'f'}});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 4', () => {
                const types = ModelParser.parseTypes({Some: {nested: 'Nested'}, Nested: {a: 'i64', b: 'i64'}});
                const expected = JSON.stringify({Some: {nested: 'Nested'}, Nested: {a: 'i64', b: 'i64'}});
                expect(types).toEqual(expected);
            });
        });

        describe('types as string', () => {
            it('should parse a simple type 1.1', () => {
                const types = ModelParser.parseTypes(`{Some: 'u8'}`);
                const expected = JSON.stringify({Some: 'u8'});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 1.2', () => {
                const types = ModelParser.parseTypes(`{Some: u8}`);
                const expected = JSON.stringify({Some: 'u8'});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 1.3', () => {
                const types = ModelParser.parseTypes(`{'Some': 'u8'}`);
                const expected = JSON.stringify({Some: 'u8'});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 1.4', () => {
                const types = ModelParser.parseTypes(`{"Some": "u8"}`);
                const expected = JSON.stringify({Some: 'u8'});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 2', () => {
                const types = ModelParser.parseTypes(`{Some:[u8,u16]}`);
                const expected = JSON.stringify({Some: ['u8', 'u16']});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 3', () => {
                const types = ModelParser.parseTypes(`{CNC:{x:f,y:f,z:f}}`);
                const expected = JSON.stringify({CNC: {x: 'f', y: 'f', z: 'f'}});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 4', () => {
                const types = ModelParser.parseTypes(`{Top:{nested:Nested},Nested:{a:i64,b:i64}}`);
                const expected = JSON.stringify({Top: {nested: 'Nested'}, Nested: {a: 'i64', b: 'i64'}});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 5', () => {
                const types = ModelParser.parseTypes(`{CNC: {f x,y,z;}}`);
                const expected = JSON.stringify({CNC: {x: 'f', y: 'f', z: 'f'}});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 6', () => {
                const types = ModelParser.parseTypes(`{ A {u8 aa; }; B {u16 bb;}; C [2/u64] }`);
                const expected = JSON.stringify({A: {aa: 'u8'}, B: {bb: 'u16'}, C: ['u64', 'u64']});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 7', () => {
                const types = ModelParser.parseTypes(`{Octave:{b:[f,f,f],v:[f,f,f]}}`);
                const expected = JSON.stringify({Octave: {b: ['f', 'f', 'f'], v: ['f', 'f', 'f']}});
                expect(types).toEqual(expected);
            });

            it('should parse a simple type 8', () => {
                const types = ModelParser.parseTypes(`{Octave:{b:[3/f],v:[3/f]}}`);
                const expected = JSON.stringify({Octave: {b: ['f', 'f', 'f'], v: ['f', 'f', 'f']}});
                expect(types).toEqual(expected);
            });
        });
    });

    describe('parseModel', () => {
        describe('model as object', () => {
            it('should parse a simple type 1', () => {
                const model = ModelParser.parseModel('u8');
                const expected = JSON.stringify('u8');
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 2', () => {
                const model = ModelParser.parseModel(['u8']);
                const expected = JSON.stringify(['u8']);
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 3', () => {
                const model = ModelParser.parseModel(['u8', 'u8']);
                const expected = JSON.stringify(['u8', 'u8']);
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 4', () => {
                const model = ModelParser.parseModel({a: 'u8', b: 'u8'});
                const expected = JSON.stringify({a: 'u8', b: 'u8'});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 5', () => {
                const model = ModelParser.parseModel({a: ['u8', 'u8']});
                const expected = JSON.stringify({a: ['u8', 'u8']});
                expect(model).toEqual(expected);
            });

            it('should parse a dynamic type 6', () => {
                const model = ModelParser.parseModel({"a.array": 'f', a: 'f'});
                const expected = JSON.stringify({"a.array": 'f', a: 'f'});
                expect(model).toEqual(expected);
            });

            it('should parse a dynamic type 7', () => {
                const model = ModelParser.parseModel({"a.string": 'f', a: 'string'});
                const expected = JSON.stringify({"a.string": 'f', a: 'string'});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 8', () => {
                const model = ModelParser.parseModel({a: {b: 'f'}});
                const expected = JSON.stringify({a: {b: 'f'}});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 9', () => {
                const model = ModelParser.parseModel({a: '[2/u8]'});
                const expected = JSON.stringify({a: ['u8', 'u8']});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 10', () => {
                const model = ModelParser.parseModel({a: 'Some'});
                const expected = JSON.stringify({a: 'Some'});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 11', () => {
                const model = ModelParser.parseModel({a: 'Some'}, {Some: 'u8'});
                const expected = JSON.stringify({a: 'u8'});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 12', () => {
                const model = ModelParser.parseModel({a: 'Some'}, {Some: ['u8', 'u16']});
                const expected = JSON.stringify({a: ['u8', 'u16']});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 13', () => {
                const model = ModelParser.parseModel('Some', {Some: ['u8', 'u16']});
                const expected = JSON.stringify(['u8', 'u16']);
                expect(model).toEqual(expected);
            });

            it('should parse a user type 14', () => {
                const model = ModelParser.parseModel('Some', {Some: {x: 'f', y: 'f', z: 'f'}});
                const expected = JSON.stringify({x: 'f', y: 'f', z: 'f'});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 15', () => {
                const model = ModelParser.parseModel('Some', {Some: '[2/u16]'});
                const expected = JSON.stringify(['u16', 'u16']);
                expect(model).toEqual(expected);
            });

            it('should parse a user type 16', () => {
                const model = ModelParser.parseModel(['Some'], {Some: {x: 'f', y: 'f', z: 'f'}});
                const expected = JSON.stringify([{x: 'f', y: 'f', z: 'f'}]);
                expect(model).toEqual(expected);
            });

            it('should parse a user type 17', () => {
                const model = ModelParser.parseModel({s: 'Some'}, {Some: {x: 'f', y: 'f', z: 'f'}});
                const expected = JSON.stringify({s: {x: 'f', y: 'f', z: 'f'}});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 18', () => {
                const model = ModelParser.parseModel({s: 'Some'}, {
                    Some: {nested: 'Nested'},
                    'Nested': {a: 'i64', b: 'i64'}
                });
                const expected = JSON.stringify({s: {nested: {a: 'i64', b: 'i64'}}});
                expect(model).toEqual(expected);
            });
        });

        describe('model as string', () => {
            it('should parse a simple type 1', () => {
                const model = ModelParser.parseModel('u8');
                const expected = JSON.stringify('u8');
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 2', () => {
                const model = ModelParser.parseModel(`[u8]`);
                const expected = JSON.stringify(['u8']);
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 3', () => {
                const model = ModelParser.parseModel(`['u8', u8]`);
                const expected = JSON.stringify(['u8', 'u8']);
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 4', () => {
                const model = ModelParser.parseModel(`{a: u8, b: 'u8'}`);
                const expected = JSON.stringify({a: 'u8', b: 'u8'});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 5', () => {
                const model = ModelParser.parseModel(`{a: [u8, u8]}`);
                const expected = JSON.stringify({a: ['u8', 'u8']});
                expect(model).toEqual(expected);
            });

            it('should parse a dynamic type 6', () => {
                const model = ModelParser.parseModel(`{ a.array: f, a: f }`);
                const expected = JSON.stringify({"a.array": 'f', a: 'f'});
                expect(model).toEqual(expected);
            });

            it('should parse a dynamic type 7', () => {
                const model = ModelParser.parseModel(`{ a.string: f, a: string }`);
                const expected = JSON.stringify({"a.string": 'f', a: 'string'});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 8', () => {
                const model = ModelParser.parseModel(`{ a: { b: f } }`);
                const expected = JSON.stringify({a: {b: 'f'}});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 9', () => {
                const model = ModelParser.parseModel(`{ a: [2/u8] }`);
                const expected = JSON.stringify({a: ['u8', 'u8']});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 10', () => {
                const model = ModelParser.parseModel(`{ a: Some }`);
                const expected = JSON.stringify({a: 'Some'});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 11', () => {
                const model = ModelParser.parseModel(`{ a: Some }`, `{ Some: u8 }`);
                const expected = JSON.stringify({a: 'u8'});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 12', () => {
                const model = ModelParser.parseModel(`{ a: Some }`, `{ Some: [u8,u16] }`);
                const expected = JSON.stringify({a: ['u8', 'u16']});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 13', () => {
                const model = ModelParser.parseModel('Some', `{ Some: [u8,u16] }`);
                const expected = JSON.stringify(['u8', 'u16']);
                expect(model).toEqual(expected);
            });

            it('should parse a user type 14', () => {
                const model = ModelParser.parseModel('Some', `{ Some: { "x": f, y: 'f', z: "f" } }`);
                const expected = JSON.stringify({x: 'f', y: 'f', z: 'f'});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 15', () => {
                const model = ModelParser.parseModel('Some', `{Some:[2/u16]}`);
                const expected = JSON.stringify(['u16', 'u16']);
                expect(model).toEqual(expected);
            });

            it('should parse a user type 16', () => {
                const model = ModelParser.parseModel(`[Some]`, `{Some:{x:f,y:f,z:f}}`);
                const expected = JSON.stringify([{x: 'f', y: 'f', z: 'f'}]);
                expect(model).toEqual(expected);
            });

            it('should parse a user type 17', () => {
                const model = ModelParser.parseModel(`{s:Some}`, `{Some:{x:f,y:f,z:f}}`);
                const expected = JSON.stringify({s: {x: 'f', y: 'f', z: 'f'}});
                expect(model).toEqual(expected);
            });

            it('should parse a user type 18', () => {
                const model = ModelParser.parseModel(`{s: Some}`, `{Some:{nested:Nested},Nested:{a:i64,b:i64}}`);
                const expected = JSON.stringify({s: {nested: {a: 'i64', b: 'i64'}}});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 19', () => {
                const model = ModelParser.parseModel(`{ a: u8, b: u8 }`);
                const expected = JSON.stringify({a: 'u8', b: 'u8'});
                expect(model).toEqual(expected);
            });

            it('should parse a simple type 20', () => {
                const model = ModelParser.parseModel(`{ a: [u8, u8] }`);
                const expected = JSON.stringify({a: ['u8', 'u8']});
                expect(model).toEqual(expected);
            });

            it('should parse a dynamic [size/type] type 21', () => {
                const model = ModelParser.parseModel(`{ abc: [f/f] }`);
                const expected = JSON.stringify({"abc.array": "f", abc: "f"});
                expect(model).toEqual(expected);
            });

            it('should parse a dynamic [size/string] type 22', () => {
                const model = ModelParser.parseModel(`{ str: [f/string] }`);
                const expected = JSON.stringify({"str.string": "f", str: "string"});
                expect(model).toEqual(expected);
            });

            it('should parse model type 23', () => {
                const model = ModelParser.parseModel(`[2/Some]`, `{Some: {a:u16,b:u8}}`);
                const expected = JSON.stringify([{a: 'u16', b: 'u8'}, {a: 'u16', b: 'u8'}]);
                expect(model).toEqual(expected);
            });
        });

        describe('model as C kind string', () => {
            it('should parse model 1', () => {
                const model = ModelParser.parseModel(`{f x,y,z;}`);
                const expected = JSON.stringify({x: 'f', y: 'f', z: 'f'});
                expect(model).toEqual(expected);
            });

            it('should parse model 2', () => {
                const model = ModelParser.parseModel(`Some`, `{Some {f x,y,z;}}`);
                const expected = JSON.stringify({x: 'f', y: 'f', z: 'f'});
                expect(model).toEqual(expected);
            });

            it('should parse model 3', () => {
                const model = ModelParser.parseModel(`[A,B,C]`, `{ A {u8 aa; }, B {u16 bb;}, C [2/u64] }`);
                const expected = JSON.stringify([{aa: 'u8'}, {bb: 'u16'}, ['u64', 'u64']]);
                expect(model).toEqual(expected);
            });

            it('should parse model 4', () => {
                const model = ModelParser.parseModel(`{u8 a;u16 b,c;}`);
                const expected = JSON.stringify({a: 'u8', b: 'u16', c: 'u16'});
                expect(model).toEqual(expected);
            });

            it('should parse model 5', () => {
                const model = ModelParser.parseModel(
                    `{
                        u8 a;
                        u16 b,c;
                        d[2/u8];
                        e{f:u64}
                    }`
                );
                const expected = JSON.stringify({
                    a: 'u8',
                    b: 'u16',
                    c: 'u16',
                    d: ['u8', 'u8'],
                    e: {f: 'u64'}
                });
                expect(model).toEqual(expected);
            });
        });

        describe('model as special string', () => {
            describe('prepareJson', () => {
                it('should remove comments', () => {
                    const json = (ModelParser as any).prepareJson(`{
                        // comment
                    }`);
                    const expected = `{}`;
                    expect(json).toEqual(expected);
                });

                it('should remove empty lines', () => {
                    const json = (ModelParser as any).prepareJson(`{
                    
                        a: u8
                        
                    }`);
                    const expected = `{a:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should remove line breaks', () => {
                    const json = (ModelParser as any).prepareJson(`{
                        \n
                        a: u8
                        
                    }`);
                    const expected = `{a:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should trim', () => {
                    const json = (ModelParser as any).prepareJson(`  {  
                    }  `);
                    const expected = `{}`;
                    expect(json).toEqual(expected);
                });

                it('should remove all `\'"`', () => {
                    const json = (ModelParser as any).prepareJson(`{
                        'a' : 1,
                        "b": "   u8  "
                        
                    }`);
                    const expected = `{a:1,b:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should remove spaces around `,:;{}[]`', () => {
                    const json = (ModelParser as any).prepareJson(`{
                        a : [ u8 ,  u8 ] , b : { c  :  u8 }
                        
                    }`);
                    const expected = `{a:[u8,u8],b:{c:u8}}`;
                    expect(json).toEqual(expected);
                });

                it('should reduce ` `x to one ` `', () => {
                    const json = (ModelParser as any).prepareJson(`{
                        a      b:"     u8     "
                        
                    }`);
                    const expected = `{a b:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should add missing `:` between key and { or [', () => {
                    const json = (ModelParser as any).prepareJson(`{
                        a{b:u8},
                        c[d:u8]                        
                    }`);
                    const expected = `{a:{b:u8},c:[d:u8]}`;
                    expect(json).toEqual(expected);
                });
            });

            describe('dynamicStringOrArray', () => {
                it('should make static string', () => {
                    const model = ModelParser.parseModel(`{
                        a:[3/s],
                        b:[4/string]                        
                    }`);
                    const expected = JSON.stringify({
                        a: "s3",
                        b: "s4"
                    });
                    expect(model).toEqual(expected);
                });

                it('should make dynamic string', () => {
                    const model = ModelParser.parseModel(`{
                        a:[i16/s],
                        b:[i16/string]
                    }`);
                    const expected = JSON.stringify({
                        "a.string": "i16", a: "string",
                        "b.string": "i16", b: "string",
                    });
                    expect(model).toEqual(expected);
                });

                it('should make static array', () => {
                    const model = ModelParser.parseModel(`{
                        a:[3/u16]                   
                    }`);
                    const expected = JSON.stringify({
                        a: ['u16', 'u16', 'u16']
                    });
                    expect(model).toEqual(expected);
                });

                it('should make dynamic array', () => {
                    const model = ModelParser.parseModel(`{
                        a:[i16/u16]
                    }`);
                    const expected = JSON.stringify({
                        "a.array": "i16", a: "u16",
                    });
                    expect(model).toEqual(expected);
                });
            });

            describe('staticArray', () => {
                it('should make static array', () => {
                    const model = ModelParser.parseModel(`
                        [3/u8],
                    `);
                    const expected = JSON.stringify(
                        ['u8', 'u8', 'u8']
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('CKindStruct', () => {
                it('should parse model A)', () => {
                    const model = ModelParser.parseModel(`{
                    struct  myStructA  {
                        u8  a , b  ;
                        u16  c , d  ;
                    }  ;
                }`);
                    const expected = JSON.stringify({myStructA: {a: 'u8', b: 'u8', c: 'u16', d: 'u16'}});
                    expect(model).toEqual(expected);
                });

                it('should parse model B)', () => {
                    const model = ModelParser.parseModel(`{
                    typedef  struct  {
                        u8  a , b  ;
                        u16  c , d  ;
                    }  myStructB  ;
                }`);
                    const expected = JSON.stringify({myStructB: {a: 'u8', b: 'u8', c: 'u16', d: 'u16'}});
                    expect(model).toEqual(expected);
                });

                it('should parse model C)', () => {
                    const model = ModelParser.parseModel(`{
                     myStructC  {
                        u8  a , b ;
                        i16  c , d ;
                    } ;
                }`);
                    const expected = JSON.stringify({myStructC: {a: 'u8', b: 'u8', c: 'i16', d: 'i16'}});
                    expect(model).toEqual(expected);
                });
            });

            describe('CKindFields', () => {
                it('should make fields of type', () => {
                    const model = ModelParser.parseModel(`{
                        u8 a,b,c;
                    }`);
                    const expected = JSON.stringify(
                        {a: 'u8', b: 'u8', c: 'u8'}
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('CKindStaticAndDynamicArrayOrString', () => {
                it('should make static array', () => {
                    const model = ModelParser.parseModel(`{
                        Type Key[2]
                    }`);
                    const expected = JSON.stringify(
                        {Key: ['Type', 'Type']}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make dynamic array', () => {
                    const model = ModelParser.parseModel(`{
                        Type Key[u8]
                    }`);
                    const expected = JSON.stringify(
                        {"Key.array": "u8", Key: "Type"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make static string s', () => {
                    const model = ModelParser.parseModel(`{
                        s Key[2]
                    }`);
                    const expected = JSON.stringify(
                        {Key: "s2"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make dynamic string s', () => {
                    const model = ModelParser.parseModel(`{
                        s Key[u8]
                    }`);
                    const expected = JSON.stringify(
                        {"Key.string": "u8", Key: "string"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make static string string', () => {
                    const model = ModelParser.parseModel(`{
                        string Key[2]
                    }`);
                    const expected = JSON.stringify(
                        {Key: "s2"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make dynamic string string', () => {
                    const model = ModelParser.parseModel(`{
                        string Key[u8]
                    }`);
                    const expected = JSON.stringify(
                        {"Key.string": "u8", Key: "string"}
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('CKindStaticArrayOrString', () => {
                it('should make static array', () => {
                    const model = ModelParser.parseModel(`
                        u8 [3];
                    `);
                    const expected = JSON.stringify(
                        ["u8","u8","u8"]
                    );
                    expect(model).toEqual(expected);
                });

                it('should make static string s', () => {
                    const model = ModelParser.parseModel(`
                        s [3];
                    `);
                    const expected = JSON.stringify(
                        "s3"
                    );
                    expect(model).toEqual(expected);
                });

                it('should make static string s', () => {
                    const model = ModelParser.parseModel(`
                        string [3];
                    `);
                    const expected = JSON.stringify(
                        "s3"
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('replaceModelTypesWithUserTypes', () => {
                it('should replace Error', () => {
                    const model = ModelParser.parseModel(
                        `{Error e;}`,
                        {Error: {msg: 's20', code: 'i16'}}
                    );
                    const expected = JSON.stringify(
                        {e: {msg: 's20', code: 'i16'}}
                    );
                    expect(model).toEqual(expected);
                });

                it('should replace Sensor 1', () => {
                    const model = ModelParser.parseModel(
                        `[2/Sensor]`,
                        `{Sensor: {type: u8, value: f, time: u64 }}`
                    );
                    const expected = JSON.stringify(
                        [{type: 'u8', value: 'f', time: 'u64'},{type: 'u8', value: 'f', time: 'u64'}]
                    );
                    expect(model).toEqual(expected);
                });

                it('should replace Sensor 2', () => {
                    const model = ModelParser.parseModel(
                        `{sensors: [2/Sensor]}`,
                        `{Sensor: {type: u8, value: f, time: u64 }}`
                    );
                    const expected = JSON.stringify(
                        {sensors: [{type: 'u8', value: 'f', time: 'u64'},{type: 'u8', value: 'f', time: 'u64'}]}
                    );
                    expect(model).toEqual(expected);
                });
            });
        });

        describe('fix json', () => {
            it('should parse model 1', () => {
                const model = ModelParser.parseModel(`{a:u8,b:u16,c:u32}`);
                const expected = JSON.stringify({a: 'u8', b: 'u16', c: 'u32'});
                expect(model).toEqual(expected);
            });

            it('should parse model 2', () => {
                const model = ModelParser.parseModel(`{a:[3/u8]}`);
                const expected = JSON.stringify({a: ['u8', 'u8', 'u8']});
                expect(model).toEqual(expected);
            });

            it('should parse model 3', () => {
                const model = ModelParser.parseModel(`{u8 a,b;}`);
                const expected = JSON.stringify({a: 'u8', b: 'u8'});
                expect(model).toEqual(expected);
            });
        });
    });
});