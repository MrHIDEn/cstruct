import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('s - string', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'abc'`, () => {
                const buffer = hexToBuffer("6162630000");
                const model = {r: 's5'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should read 'abc' with offset 2`, () => {
                const buffer = hexToBuffer("0000 6162630000");
                const model = {r: 's5'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });

        describe(`make`, () => {
            it(`should make 0x123456789ABCDEF0`, () => {
                const model = {r: 's5'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer("6162630000");

                const result = cStruct.make({r: "abc"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });
        });

        describe(`write`, () => {
            it(`should write 0x123456789ABCDEF0`, () => {
                const model = {r: 's5'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000000000");
                const expected = hexToBuffer("6162630000");

                const result = cStruct.write(buffer, {r: "abc"});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should write 0x123456789ABCDEF0 with offset 2`, () => {
                const model = {r: 's5'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 0000000000");
                const expected = hexToBuffer("0000 6162630000");

                const result = cStruct.write(buffer, {r: "abc"}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'abc'`, () => {
                const buffer = hexToBuffer("6162630000");
                const model = {r: 's5'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should read 'abc' with offset 2`, () => {
                const buffer = hexToBuffer("0000 6162630000");
                const model = {r: 's5'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe("abc");
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });

        describe(`make`, () => {
            it(`should make 0x123456789ABCDEF0`, () => {
                const model = {r: 's5'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer("6162630000");

                const result = cStruct.make({r: "abc"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });
        });

        describe(`write`, () => {
            it(`should write 0x123456789ABCDEF0`, () => {
                const model = {r: 's5'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000000000");
                const expected = hexToBuffer("6162630000");

                const result = cStruct.write(buffer, {r: "abc"});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should write 0x123456789ABCDEF0 with offset 2`, () => {
                const model = {r: 's5'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 0000000000");
                const expected = hexToBuffer("0000 6162630000");

                const result = cStruct.write(buffer, {r: "abc"}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });
    });
});