import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('ws - string', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'abc'`, () => {
                const buffer = hexToBuffer("61006200630000000000");
                const model = {r: 'ws5'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read 'abc' with offset 2`, () => {
                const buffer = hexToBuffer("0000 61006200630000000000");
                const model = {r: 'ws5'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });

        describe(`make`, () => {
            it(`should make 0x12003400560078009A00BC00DE00F000`, () => {
                const model = {r: 'ws5'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer("61006200630000000000");

                const result = cStruct.make({r: "abc"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12003400560078009A00BC00DE00F000`, () => {
                const model = {r: 'ws5'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("00000000000000000000");
                const expected = hexToBuffer("61006200630000000000");

                const result = cStruct.write(buffer, {r: "abc"});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should write 0x12003400560078009A00BC00DE00F000 with offset 2`, () => {
                const model = {r: 'ws5'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 00000000000000000000");
                const expected = hexToBuffer("0000 61006200630000000000");

                const result = cStruct.write(buffer, {r: "abc"}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'abc'`, () => {
                const buffer = hexToBuffer("61006200630000000000");
                const model = {r: 'ws5'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read 'abc' with offset 2`, () => {
                const buffer = hexToBuffer("0000 61006200630000000000");
                const model = {r: 'ws5'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });

        describe(`make`, () => {
            it(`should make 0x12003400560078009A00BC00DE00F000`, () => {
                const model = {r: 'ws5'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer("61006200630000000000");

                const result = cStruct.make({r: "abc"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12003400560078009A00BC00DE00F000`, () => {
                const model = {r: 'ws5'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("00000000000000000000");
                const expected = hexToBuffer("61006200630000000000");

                const result = cStruct.write(buffer, {r: "abc"});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should write 0x12003400560078009A00BC00DE00F000 with offset 2`, () => {
                const model = {r: 'ws5'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 00000000000000000000");
                const expected = hexToBuffer("0000 61006200630000000000");

                const result = cStruct.write(buffer, {r: "abc"}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });
    });
});