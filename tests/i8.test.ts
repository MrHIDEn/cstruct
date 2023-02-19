import { CStructBE, CStructLE } from "../src";

describe('i8 - signed char', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 0xEF`, () => {
                const buffer = Buffer.from([0xEF]);
                const model = {r: 'i8'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-17);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 0xEF with offset 2`, () => {
                const buffer = Buffer.from([0x00, 0x00, 0xEF]);
                const model = {r: 'i8'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-17);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 0xEF`, () => {
                const model = {r: 'i8'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.make({r: -17});
                expect(result.buffer).toEqual(Buffer.from([0xEF]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });

        describe(`write`, () => {
            it(`should write 0xEF`, () => {
                const model = {r: 'i8'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = Buffer.from([0x00]);
                const expected = Buffer.from([0xEF]);

                const result = cStruct.write(buffer, {r: -17});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 0xEF with offset 2`, () => {
                const model = {r: 'i8'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = Buffer.from([0x00, 0x00, 0x00]);
                const expected = Buffer.from([0x00, 0x00, 0xEF]);

                const result = cStruct.write(buffer, {r: -17}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 0xEF`, () => {
                const buffer = Buffer.from([0xEF]);
                const model = {r: 'i8'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-17);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 0xEF with offset 2`, () => {
                const buffer = Buffer.from([0x00, 0x00, 0xEF]);
                const model = {r: 'i8'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-17);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 0xEF`, () => {
                const model = {r: 'i8'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.make({r: -17});
                expect(result.buffer).toEqual(Buffer.from([0xEF]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });

        describe(`write`, () => {
            it(`should write 0xEF`, () => {
                const model = {r: 'i8'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = Buffer.from([0x00]);
                const expected = Buffer.from([0xEF]);

                const result = cStruct.write(buffer, {r: -17});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 0xEF with offset 2`, () => {
                const model = {r: 'i8'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = Buffer.from([0x00, 0x00, 0x00]);
                const expected = Buffer.from([0x00, 0x00, 0xEF]);

                const result = cStruct.write(buffer, {r: -17}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });
    });
});