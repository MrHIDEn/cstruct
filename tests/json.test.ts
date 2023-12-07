import { hexToBuffer, CStructBE, CStructLE } from "../src";

describe('j - json - any - JSON', () => {
    describe('BE', () => {
        describe(`make dynamic`, () => {
            it(`should make buffer from j[i16]`, () => {
                const model = {any1: 'j[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('0011_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(19);
                expect(result.size).toBe(19);
            });

            it(`should make buffer from json[i16]`, () => {
                const model = {any1: 'json[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('0011_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(19);
                expect(result.size).toBe(19);
            });

            it(`should make buffer from any[i16]`, () => {
                const model = {any1: 'any[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('0011_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(19);
                expect(result.size).toBe(19);
            });
        });

        describe(`make static`, () => {
            it(`should make buffer from j[20]`, () => {
                const model = {any1: 'j[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(20);
            });

            it(`should make buffer from json[20]`, () => {
                const model = {any1: 'json[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(20);
            });

            it(`should make buffer from any[20]`, () => {
                const model = {any1: 'any[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(20);
            });
        });
        
        describe(`write dynamic with offset 2`, () => {
            it(`should write buffer from j[i16]`, () => {
                const model = {any1: 'j[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer = hexToBuffer('0000_0000_0000000000000000000000000000000000');
                const expected = hexToBuffer('0000_0011_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should write buffer from json[i16]`, () => {
                const model = {any1: 'json[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer = hexToBuffer('0000_0000_0000000000000000000000000000000000');
                const expected = hexToBuffer('0000_0011_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should write buffer from any[i16]`, () => {
                const model = {any1: 'any[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer = hexToBuffer('0000_0000_0000000000000000000000000000000000');
                const expected = hexToBuffer('0000_0011_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });
        });

        describe(`write static with offset 2`, () => {
            it(`should write buffer from j[20]`, () => {
                const model = {any1: 'j[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer =   hexToBuffer('0000_1111111111111111111111111111111111111111');
                const expected = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should write buffer from json[20]`, () => {
                const model = {any1: 'json[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer =   hexToBuffer('0000_1111111111111111111111111111111111111111');
                const expected = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should write buffer from any[20]`, () => {
                const model = {any1: 'any[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer =   hexToBuffer('0000_1111111111111111111111111111111111111111');
                const expected = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });
        });

        describe(`read dynamic with offset 2`, () => {
            it(`should read buffer from j[i16]`, () => {
                const model = {any1: 'j[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_0011_7b2261223a312c2262223a5b322c335d7d');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should read buffer from json[i16]`, () => {
                const model = {any1: 'json[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_0011_7b2261223a312c2262223a5b322c335d7d');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should read buffer from any[i16]`, () => {
                const model = {any1: 'any[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_0011_7b2261223a312c2262223a5b322c335d7d');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });
        });

        describe(`read static with offset 2`, () => {
            it(`should read buffer from j[20]`, () => {
                const model = {any1: 'j[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should read buffer from json[20]`, () => {
                const model = {any1: 'json[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should read buffer from any[20]`, () => {
                const model = {any1: 'any[20]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });
        });
    });

    describe('LE', () => {
        describe(`make dynamic`, () => {
            it(`should make buffer from j[i16]`, () => {
                const model = {any1: 'j[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('1100_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(19);
                expect(result.size).toBe(19);
            });

            it(`should make buffer from json[i16]`, () => {
                const model = {any1: 'json[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('1100_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(19);
                expect(result.size).toBe(19);
            });

            it(`should make buffer from any[i16]`, () => {
                const model = {any1: 'any[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('1100_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(19);
                expect(result.size).toBe(19);
            });
        });

        describe(`make static`, () => {
            it(`should make buffer from j[20]`, () => {
                const model = {any1: 'j[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(20);
            });

            it(`should make buffer from json[20]`, () => {
                const model = {any1: 'json[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(20);
            });

            it(`should make buffer from any[20]`, () => {
                const model = {any1: 'any[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(20);
            });
        });

        describe(`write dynamic with offset 2`, () => {
            it(`should write buffer from j[i16]`, () => {
                const model = {any1: 'j[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer = hexToBuffer('0000_0000_0000000000000000000000000000000000');
                const expected = hexToBuffer('0000_1100_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should write buffer from json[i16]`, () => {
                const model = {any1: 'json[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer = hexToBuffer('0000_0000_0000000000000000000000000000000000');
                const expected = hexToBuffer('0000_1100_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should write buffer from any[i16]`, () => {
                const model = {any1: 'any[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer = hexToBuffer('0000_0000_0000000000000000000000000000000000');
                const expected = hexToBuffer('0000_1100_7b2261223a312c2262223a5b322c335d7d');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });
        });

        describe(`write static with offset 2`, () => {
            it(`should write buffer from j[20]`, () => {
                const model = {any1: 'j[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer =   hexToBuffer('0000_1111111111111111111111111111111111111111');
                const expected = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should write buffer from json[20]`, () => {
                const model = {any1: 'json[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer =   hexToBuffer('0000_1111111111111111111111111111111111111111');
                const expected = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should write buffer from any[20]`, () => {
                const model = {any1: 'any[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a:1,b:[2,3]}};
                const buffer =   hexToBuffer('0000_1111111111111111111111111111111111111111');
                const expected = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });
        });

        describe(`read dynamic with offset 2`, () => {
            it(`should read buffer from j[i16]`, () => {
                const model = {any1: 'j[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_1100_7b2261223a312c2262223a5b322c335d7d');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should read buffer from json[i16]`, () => {
                const model = {any1: 'json[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_1100_7b2261223a312c2262223a5b322c335d7d');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });

            it(`should read buffer from any[i16]`, () => {
                const model = {any1: 'any[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_1100_7b2261223a312c2262223a5b322c335d7d');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.i16': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(21);
                expect(result.size).toBe(19);
            });
        });

        describe(`read static with offset 2`, () => {
            it(`should read buffer from j[20]`, () => {
                const model = {any1: 'j[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should read buffer from json[20]`, () => {
                const model = {any1: 'json[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });

            it(`should read buffer from any[20]`, () => {
                const model = {any1: 'any[20]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000_7b2261223a312c2262223a5b322c335d7d000000');
                const expected = {any1: {a:1,b:[2,3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.20': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(22);
                expect(result.size).toBe(20);
            });
        });
    });
});