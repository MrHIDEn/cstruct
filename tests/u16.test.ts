import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('u16 - unsigned int16', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 0x1234`, () => {
                const buffer = hexToBuffer("1234");
                const model = {r: 'u16'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x1234);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read 0x12 with offset 2`, () => {
                const buffer = hexToBuffer("0000 1234");
                const model = {r: 'u16'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x1234);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });

        describe(`make`, () => {
            it(`should make 0x1234`, () => {
                const model = {r: 'u16'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer("1234");

                const result = cStruct.make({r: 0x1234});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12`, () => {
                const model = {r: 'u16'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000");
                const expected = hexToBuffer("1234");

                const result = cStruct.write(buffer, {r: 0x1234});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 0x12 with offset 2`, () => {
                const model = {r: 'u16'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 0000");
                const expected = hexToBuffer("0000 1234");

                const result = cStruct.write(buffer, {r: 0x1234}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 0x1234`, () => {
                const buffer = hexToBuffer("3412");
                const model = {r: 'u16'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x1234);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read 0x12 with offset 2`, () => {
                const buffer = hexToBuffer("0000 3412");
                const model = {r: 'u16'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x1234);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });

        describe(`make`, () => {
            it(`should make 0x1234`, () => {
                const model = {r: 'u16'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer("3412");

                const result = cStruct.make({r: 0x1234});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12`, () => {
                const model = {r: 'u16'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000");
                const expected = hexToBuffer("3412");

                const result = cStruct.write(buffer, {r: 0x1234});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 0x12 with offset 2`, () => {
                const model = {r: 'u16'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 0000");
                const expected = hexToBuffer("0000 3412");

                const result = cStruct.write(buffer, {r: 0x1234}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });
    });
});