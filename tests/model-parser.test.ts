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

            it('should parse model type 23', () => {
                const model = ModelParser.parseModel(`[2/Some]`, `{Some: {a:u16,b:u8}}`);
                const expected = JSON.stringify([{a: 'u16', b: 'u8'}, {a: 'u16', b: 'u8'}]);
                expect(model).toEqual(expected);
            });
        });

        describe('model as special string', () => {
            const ModelParserAny = ModelParser as any; // eslint-disable-line @typescript-eslint/no-explicit-any

            describe('prepareJson', () => {
                it('should remove comments', () => {
                    const json = ModelParserAny.prepareJson(`{
                        // comment
                    }`);
                    const expected = `{}`;
                    expect(json).toEqual(expected);
                });

                it('should remove empty lines', () => {
                    const json = ModelParserAny.prepareJson(`{
                    
                        a: u8
                        
                    }`);
                    const expected = `{a:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should remove line breaks', () => {
                    const json = ModelParserAny.prepareJson(`{
                        \n
                        a: u8
                        
                    }`);
                    const expected = `{a:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should trim', () => {
                    const json = ModelParserAny.prepareJson(`  {  
                    }  `);
                    const expected = `{}`;
                    expect(json).toEqual(expected);
                });

                it('should remove all `\'"`', () => {
                    const json = ModelParserAny.prepareJson(`{
                        'a' : 1,
                        "b": "   u8  "
                        
                    }`);
                    const expected = `{a:1,b:u8}`;
                    expect(json).toEqual(expected);
                });

                it('should remove spaces around `,:;{}[]`', () => {
                    const json = ModelParserAny.prepareJson(`{
                        a : [ u8 ,  u8 ] , b : { c  :  u8 }
                        
                    }`);
                    const expected = `{a:[u8,u8],b:{c:u8}}`;
                    expect(json).toEqual(expected);
                });

                it('should reduce ` `x to one ` `', () => {
                    const json = ModelParserAny.prepareJson(`{
                        a      b:"     u8     "
                        
                    }`);
                    const expected = `{a b:u8}`;
                    expect(json).toEqual(expected);
                });
            });

            describe('staticArray', () => {
                it('should make static array', () => {
                    const model = ModelParser.parseModel(`{
                        a:[3/u16]                   
                    }`);
                    const expected = JSON.stringify({
                        a: ['u16', 'u16', 'u16']
                    });
                    expect(model).toEqual(expected);
                });
            });

            describe('staticOrDynamic', () => {
                it('should make dynamic string', () => {
                    const model = ModelParser.parseModel(`
                        {some: string[i8]}
                    `);
                    const expected = JSON.stringify(
                        {"some.i8": "s"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make dynamic string', () => {
                    const model = ModelParser.parseModel(`
                        {some: s[i8]}
                    `);
                    const expected = JSON.stringify(
                        {"some.i8": "s"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should make dynamic array', () => {
                    const model = ModelParser.parseModel(`
                        {some:Abc[i8]}
                    `);
                    const expected = JSON.stringify(
                        {"some.i8": "Abc"}
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('cKindFields', () => {
                it('should translate c-kind fields {u8 a,b;i32 x,y,z;} into JSON', () => {
                    const model = ModelParser.parseModel(
                        `{u8 a,b;i32 x,y,z;}`
                    );
                    const expected = JSON.stringify(
                        {a: "u8", b: "u8", x: "i32", y: "i32", z: "i32"}
                    );
                    expect(model).toEqual(expected);
                });

                it('should translate c-kind fields {u8 a,b;i32 x,y,z;} into JSON', () => {
                    const model = ModelParser.parseModel(
                        `{Xyz x,y,z;}`
                    );
                    const expected = JSON.stringify(
                        {x: "Xyz", y: "Xyz", z: "Xyz"}
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('cKindStructs', () => {
                it('should translate c-kind fields {typedef struct{uint8_t x;uint8_t y;uint8_t z;}Xyz;}', () => {
                    const model = ModelParser.parseModel(
                        `{
                        typedef struct {
                            uint8_t x;
                            uint8_t y;
                            uint8_t z;
                            } Xyz;
                        }`
                    );
                    const expected = JSON.stringify(
                        {Xyz: {x: "uint8_t", y: "uint8_t", z: "uint8_t"}}
                    );
                    expect(model).toEqual(expected);
                });
            });

            describe('replaceModelTypesWithUserTypes', () => {
                it('should replace Error', () => {
                    const model = ModelParser.parseModel(
                        `{e: Error}`,
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
                        [{type: 'u8', value: 'f', time: 'u64'}, {type: 'u8', value: 'f', time: 'u64'}]
                    );
                    expect(model).toEqual(expected);
                });

                it('should replace Sensor 2', () => {
                    const model = ModelParser.parseModel(
                        `{sensors: [2/Sensor]}`,
                        `{Sensor: {type: u8, value: f, time: u64 }}`
                    );
                    const expected = JSON.stringify(
                        {sensors: [{type: 'u8', value: 'f', time: 'u64'}, {type: 'u8', value: 'f', time: 'u64'}]}
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
        });
    });
});