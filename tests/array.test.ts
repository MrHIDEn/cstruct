import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('Array', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {r: number[]}`, () => {
                const buffer = hexToBuffer('1234 5678');
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read {r: number[]} with offset 2`, () => {
                const buffer = hexToBuffer('0000 1234 5678');
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read number[]`, () => {
                const buffer = hexToBuffer('1234 5678');
                const model = ['u16', 'u16'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read number[] with offset 2`, () => {
                const buffer = hexToBuffer('0000 1234 5678');
                const model = ['u16', 'u16'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read string[] with offset 2`, () => {
                const buffer = hexToBuffer('0000 61620000 63640000');
                const model = ['s4', 's4'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should read wstring[] with offset 2`, () => {
                const buffer = hexToBuffer('0000 610062000000 630064000000');
                const model = ['ws3', 'ws3'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(14);
                expect(result.size).toBe(12);
            });
        });

        describe(`make`, () => {
            it(`should make {r: number[]}`, () => {
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({r: [0x1234, 0x5678]});
                expect(result.buffer).toEqual(hexToBuffer('1234 5678'));
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make number[]`, () => {
                const model = ['u16', 'u16'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make([0x1234, 0x5678]);
                expect(result.buffer).toEqual(hexToBuffer('1234 5678'));
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make string[]`, () => {
                const model = ['s4', 's4'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make(['ab', 'cd']);
                expect(result.buffer).toEqual(hexToBuffer('61620000 63640000'));
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make wstring[]`, () => {
                const model = ['ws3', 'ws3'];
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make(['ab', 'cd']);
                expect(result.buffer).toEqual(hexToBuffer('610062000000 630064000000'));
                expect(result.offset).toBe(12);
                expect(result.size).toBe(12);
            });
        });

        describe(`write`, () => {
            it(`should write {r: number[]}`, () => {
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000');
                const expected = hexToBuffer('1234 5678');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write {r: number[]} with offset 2`, () => {
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('0000 1234 5678');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write number[]`, () => {
                const model = ['u16', 'u16'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000');
                const expected = hexToBuffer('1234 5678');

                const result = cStruct.write(buffer, [0x1234, 0x5678]);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write number[] with offset 2`, () => {
                const model = ['u16', 'u16'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('0000 1234 5678');

                const result = cStruct.write(buffer, [0x1234, 0x5678], 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write string[]`, () => {
                const model = ['s4', 's4'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('00000000 00000000');
                const expected = hexToBuffer('61620000 63640000');

                const result = cStruct.write(buffer, ['ab', 'cd']);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write string[] with offset 2`, () => {
                const model = ['s4', 's4'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 00000000 00000000');
                const expected = hexToBuffer('0000 61620000 63640000');

                const result = cStruct.write(buffer, ['ab', 'cd'], 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should write wstring[]`, () => {
                const model = ['ws3', 'ws3'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '000000000000 000000000000');
                const expected = hexToBuffer('610062000000 630064000000');

                const result = cStruct.write(buffer, ['ab', 'cd']);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(12);
            });

            it(`should write wstring[] with offset 2`, () => {
                const model = ['ws3', 'ws3'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '0000 000000000000 000000000000');
                const expected = hexToBuffer('0000 610062000000 630064000000');

                const result = cStruct.write(buffer, ['ab', 'cd'], 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(14);
                expect(result.size).toBe(12);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {r: number[]}`, () => {
                const buffer = hexToBuffer('3412 7856');
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read {r: number[]} with offset 2`, () => {
                const buffer = hexToBuffer('0000 3412 7856');
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read number[]`, () => {
                const buffer = hexToBuffer('3412 7856');
                const model = ['u16', 'u16'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read number[] with offset 2`, () => {
                const buffer = hexToBuffer('0000 3412 7856');
                const model = ['u16', 'u16'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read string[] with offset 2`, () => {
                const buffer = hexToBuffer('0000 61620000 63640000');
                const model = ['s4', 's4'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should read string[] with offset 2`, () => {
                const buffer = hexToBuffer('0000 610062000000 630064000000');
                const model = ['ws3', 'ws3'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(14);
                expect(result.size).toBe(12);
            });
        });

        describe(`make`, () => {
            it(`should make {r: number[]}`, () => {
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make({r: [0x1234, 0x5678]});
                expect(result.buffer).toEqual(hexToBuffer('3412 7856'));
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make number[]`, () => {
                const model = ['u16', 'u16'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make([0x1234, 0x5678]);
                expect(result.buffer).toEqual(hexToBuffer('3412 7856'));
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make string[]`, () => {
                const model = ['s4', 's4'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make(['ab', 'cd']);
                expect(result.buffer).toEqual(hexToBuffer('61620000 63640000'));
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make wstring[]`, () => {
                const model = ['ws3', 'ws3'];
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make(['ab', 'cd']);
                expect(result.buffer).toEqual(hexToBuffer('610062000000 630064000000'));
                expect(result.offset).toBe(12);
                expect(result.size).toBe(12);
            });
        });

        describe(`write`, () => {
            it(`should write {r: number[]}`, () => {
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000');
                const expected = hexToBuffer('3412 7856');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write {r: number[]} with offset 2`, () => {
                const model = {r: ['u16', 'u16']};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('0000 3412 7856');

                const result = cStruct.write(buffer, {r: [0x1234, 0x5678]}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write number[]`, () => {
                const model = ['u16', 'u16'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000');
                const expected = hexToBuffer('3412 7856');

                const result = cStruct.write(buffer, [0x1234, 0x5678]);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write number[] with offset 2`, () => {
                const model = ['u16', 'u16'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('0000 3412 7856');

                const result = cStruct.write(buffer, [0x1234, 0x5678], 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write string[]`, () => {
                const model = ['s4', 's4'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('00000000 00000000');
                const expected = hexToBuffer('61620000 63640000');

                const result = cStruct.write(buffer, ['ab', 'cd']);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write string[] with offset 2`, () => {
                const model = ['s4', 's4'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 00000000 00000000');
                const expected = hexToBuffer('0000 61620000 63640000');

                const result = cStruct.write(buffer, ['ab', 'cd'], 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should write wstring[]`, () => {
                const model = ['ws3', 'ws3'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '000000000000 000000000000');
                const expected = hexToBuffer('610062000000 630064000000');

                const result = cStruct.write(buffer, ['ab', 'cd']);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(12);
            });

            it(`should write wstring[] with offset 2`, () => {
                const model = ['ws3', 'ws3'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 000000000000 000000000000');
                const expected = hexToBuffer('0000 610062000000 630064000000');

                const result = cStruct.write(buffer, ['ab', 'cd'], 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(14);
                expect(result.size).toBe(12);
            });
        });
    });
});