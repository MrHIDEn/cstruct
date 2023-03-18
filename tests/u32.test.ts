import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('u32 - unsigned int32', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 0x12345678`, () => {
                const buffer = hexToBuffer("12345678");
                const model = {r: 'u32'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x12345678);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 0x12345678 with offset 2`, () => {
                const buffer = hexToBuffer("0000 12345678");
                const model = {r: 'u32'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x12345678);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make 0x12345678`, () => {
                const model = {r: 'u32'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer("12345678");

                const result = cStruct.make({r: 0x12345678});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12345678`, () => {
                const model = {r: 'u32'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("00000000");
                const expected = hexToBuffer("12345678");

                const result = cStruct.write(buffer, {r: 0x12345678});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write 0x12345678 with offset 2`, () => {
                const model = {r: 'u32'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 00000000");
                const expected = hexToBuffer("0000 12345678");

                const result = cStruct.write(buffer, {r: 0x12345678}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 0x12345678`, () => {
                const buffer = hexToBuffer("78563412");
                const model = {r: 'u32'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x12345678);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 0x12345678 with offset 2`, () => {
                const buffer = hexToBuffer("0000 78563412");
                const model = {r: 'u32'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x12345678);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make 0x12345678`, () => {
                const model = {r: 'u32'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer("78563412");

                const result = cStruct.make({r: 0x12345678});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12345678`, () => {
                const model = {r: 'u32'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("00000000");
                const expected = hexToBuffer("78563412");

                const result = cStruct.write(buffer, {r: 0x12345678});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write 0x12345678 with offset 2`, () => {
                const model = {r: 'u32'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 00000000");
                const expected = hexToBuffer("0000 78563412");

                const result = cStruct.write(buffer, {r: 0x12345678}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });
});