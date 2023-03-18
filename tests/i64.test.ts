import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('i64 - signed int64', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read -81985529216486896n`, () => {
                const buffer = hexToBuffer("FEDCBA9876543210");
                const model = {r: 'i64'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-81985529216486896n);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read -81985529216486896n with offset 2`, () => {
                const buffer = hexToBuffer("0000 FEDCBA9876543210");
                const model = {r: 'i64'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-81985529216486896n);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make -81985529216486896n`, () => {
                const model = {r: 'i64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer("FEDCBA9876543210");

                const result = cStruct.make({r: -81985529216486896n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write -81985529216486896n`, () => {
                const model = {r: 'i64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000000000000000");
                const expected = hexToBuffer("FEDCBA9876543210");

                const result = cStruct.write(buffer, {r: -81985529216486896n});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write -81985529216486896n with offset 2`, () => {
                const model = {r: 'i64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 0000000000000000");
                const expected = hexToBuffer("0000 FEDCBA9876543210");

                const result = cStruct.write(buffer, {r: -81985529216486896n}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read -81985529216486896n`, () => {
                const buffer = hexToBuffer("1032547698BADCFE");
                const model = {r: 'i64'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-81985529216486896n);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read -81985529216486896n with offset 2`, () => {
                const buffer = hexToBuffer("0000 1032547698BADCFE");
                const model = {r: 'i64'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-81985529216486896n);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make -81985529216486896n`, () => {
                const model = {r: 'i64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer("1032547698BADCFE");

                const result = cStruct.make({r: -81985529216486896n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write -81985529216486896n`, () => {
                const model = {r: 'i64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000000000000000");
                const expected = hexToBuffer("1032547698BADCFE");

                const result = cStruct.write(buffer, {r: -81985529216486896n});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write -81985529216486896n with offset 2`, () => {
                const model = {r: 'i64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer("0000 0000000000000000");
                const expected = hexToBuffer("0000 1032547698BADCFE");

                const result = cStruct.write(buffer, {r: -81985529216486896n}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });
});