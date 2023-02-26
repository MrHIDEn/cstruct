import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('dynamic array', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructBE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0002 1234 5678');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 'u16[i16]'} with offset 2`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructBE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0000 0002 1234 5678');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructBE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0002 61620000 63640000');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read {r: 's4[i16]'} with offset 2`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructBE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 0002 61620000 63640000');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });

        describe(`make`, () => {
            it(`should make {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructBE<{ r: number[] }>(model);

                const result = cStruct.make({r: [0x1234, 0x5678]});
                expect(result.buffer).toEqual(hexToBuffer('0002 1234 5678'));
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should make {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructBE<{ r: string[] }>(model);

                const result = cStruct.make({r: ['ab', 'cd']});
                expect(result.buffer).toEqual(hexToBuffer('0002 61620000 63640000'));
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });
        });

        describe(`write`, () => {
            it(`should write {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructBE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('0002 1234 5678');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should write {r: 'u16[i16]'} with offset 2`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructBE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0000 0000 0000 0000');
                const expected = hexToBuffer('0000 0002 1234 5678');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should write {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructBE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 00000000 00000000');
                const expected = hexToBuffer('0002 61620000 63640000');

                const result = cStruct.write(buffer, {r: ['ab', 'cd']});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should write {r: 's4[i16]'} with offset 2`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructBE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 0000 00000000 00000000');
                const expected = hexToBuffer('0000 0002 61620000 63640000');

                const result = cStruct.write(buffer, {r: ['ab', 'cd']}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructLE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0200 3412 7856');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 'u16[i16]'} with offset 2`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructLE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0000 0200 3412 7856');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructLE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0200 61620000 63640000');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read {r: 's4[i16]'} with offset 2`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructLE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 0200 61620000 63640000');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });

        describe(`make`, () => {
            it(`should make {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructLE<{ r: number[] }>(model);

                const result = cStruct.make({r: [0x1234, 0x5678]});
                expect(result.buffer).toEqual(hexToBuffer('0200 3412 7856'));
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should make {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructLE<{ r: string[] }>(model);

                const result = cStruct.make({r: ['ab', 'cd']});
                expect(result.buffer).toEqual(hexToBuffer('0200 61620000 63640000'));
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });
        });

        describe(`write`, () => {
            it(`should write {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructLE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('0200 3412 7856');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should write {r: 'u16[i16]'} with offset 2`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = new CStructLE<{ r: number[] }>(model);
                const buffer = hexToBuffer('0000 0000 0000 0000');
                const expected = hexToBuffer('0000 0200 3412 7856');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should write {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructLE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 00000000 00000000');
                const expected = hexToBuffer('0200 61620000 63640000');

                const result = cStruct.write(buffer, {r: ['ab', 'cd']});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should write {r: 's4[i16]'} with offset 2`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = new CStructLE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 0000 00000000 00000000');
                const expected = hexToBuffer('0000 0200 61620000 63640000');

                const result = cStruct.write(buffer, {r: ['ab', 'cd']}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });
    });
});