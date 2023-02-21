import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('i32 - signed int32', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read -19088744`, () => {
                const buffer = hexToBuffer("FEDCBA98");
                const model = {r: 'i32'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read -19088744 with offset 2`, () => {
                const buffer = hexToBuffer("0000 FEDCBA98");
                const model = {r: 'i32'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make -19088744`, () => {
                const model = {r: 'i32'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const expected = hexToBuffer("FEDCBA98");

                const result = cStruct.make({r: -19088744});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write -19088744`, () => {
                const model = {r: 'i32'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = hexToBuffer("00000000");
                const expected = hexToBuffer("FEDCBA98");

                const result = cStruct.write(buffer, {r: -19088744});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write -19088744 with offset 2`, () => {
                const model = {r: 'i32'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = hexToBuffer("0000 00000000");
                const expected = hexToBuffer("0000 FEDCBA98");

                const result = cStruct.write(buffer, {r: -19088744}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read -19088744`, () => {
                const buffer = hexToBuffer("98BADCFE");
                const model = {r: 'i32'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read -19088744 with offset 2`, () => {
                const buffer = hexToBuffer("0000 98BADCFE");
                const model = {r: 'i32'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make -19088744`, () => {
                const model = {r: 'i32'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const expected = hexToBuffer("98BADCFE");

                const result = cStruct.make({r: -19088744});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write -19088744`, () => {
                const model = {r: 'i32'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = hexToBuffer("00000000");
                const expected = hexToBuffer("98BADCFE");

                const result = cStruct.write(buffer, {r: -19088744});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write -19088744 with offset 2`, () => {
                const model = {r: 'i32'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = hexToBuffer("0000 00000000");
                const expected = hexToBuffer("0000 98BADCFE");

                const result = cStruct.write(buffer, {r: -19088744}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });
});