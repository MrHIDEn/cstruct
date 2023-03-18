import { hexToBuffer, CStructBE, CStructLE } from "../src";


describe('dynamic array', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0002 1234 5678');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 'u16[i16]'} with offset 2`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0002 1234 5678');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0002 61620000 63640000');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read {r: 's4[i16]'} with offset 2`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0002 61620000 63640000');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });

            it(`should read {ab: "Ab[i16]"}`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructBE.fromModelTypes(model, types);
                const buffer = hexToBuffer('0002_FF_01_FE_02');
                const expected = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };

                const result = cStruct.read(buffer);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should read {ab: "Ab[i16]"} with offset 2`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructBE.fromModelTypes(model, types);
                const buffer = hexToBuffer('7777 0002_FF_01_FE_02');
                const expected = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should read {ab: "s4[i16]"}`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0002_41420000_41424300');
                const expected = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };

                const result = cStruct.read(buffer);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read {ab: "s4[i16]"} with offset 2`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 0002_41420000_41424300');
                const expected = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });

        describe(`make`, () => {
            it(`should make {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({r: [0x1234, 0x5678]});
                expect(result.buffer).toEqual(hexToBuffer('0002 1234 5678'));
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should make {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({r: ['ab', 'cd']});
                expect(result.buffer).toEqual(hexToBuffer('0002 61620000 63640000'));
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should make {ab: "Ab[i16]"}`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructBE.fromModelTypes(model, types);
                const struct = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };
                const expected = hexToBuffer('0002_FF_01_FE_02');

                const result = cStruct.make(struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should make {ab: "s4[i16]"}`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };
                const expected = hexToBuffer('0002_41420000_41424300');

                const result = cStruct.make(struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should make [i8, i8[2], i8[i16]]`, () => {
                const model = `[i8, i8[2], i8[i16]]`;
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = [
                    0x01,
                    [0x02, 0x03],
                    [0x04, 0x05, 0x06, 0x07],
                ];
                const expected = hexToBuffer('01 02_03 0004_04_05_06_07');

                const result = cStruct.make(struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(9);
                expect(result.size).toBe(9);
            });
        });

        describe(`write`, () => {
            it(`should write {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
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
                const cStruct = CStructBE.fromModelTypes(model);
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
                const cStruct = CStructBE.fromModelTypes(model);
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
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 00000000 00000000');
                const expected = hexToBuffer('0000 0002 61620000 63640000');

                const result = cStruct.write(buffer, {r: ['ab', 'cd']}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });

            it(`should write {ab: "Ab[i16]"}`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructBE.fromModelTypes(model, types);
                const struct = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };
                const buffer = hexToBuffer('0000_00_00_00_00');
                const expected = hexToBuffer('0002_FF_01_FE_02');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should write {ab: "Ab[i16]"} with offset 2`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructBE.fromModelTypes(model, types);
                const struct = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };
                const buffer = hexToBuffer('7777 0000_00_00_00_00');
                const expected = hexToBuffer('7777 0002_FF_01_FE_02');

                const result = cStruct.write(buffer, struct, 2);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should write {ab: "s4[i16]"}`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };
                const buffer = hexToBuffer('0000_00000000_00000000');
                const expected = hexToBuffer('0002_41420000_41424300');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should write {ab: "s4[i16]"} with offset 2`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };
                const buffer = hexToBuffer('7777 0000_00000000_00000000');
                const expected = hexToBuffer('7777 0002_41420000_41424300');

                const result = cStruct.write(buffer, struct, 2);
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
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0200 3412 7856');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 'u16[i16]'} with offset 2`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0200 3412 7856');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual([0x1234, 0x5678]);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should read {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0200 61620000 63640000');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read {r: 's4[i16]'} with offset 2`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0200 61620000 63640000');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual(['ab', 'cd']);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });

            it(`should read {ab: "Ab[i16]"}`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructLE.fromModelTypes(model, types);
                const buffer = hexToBuffer('0200_FF_01_FE_02');
                const expected = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };

                const result = cStruct.read(buffer);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should read {ab: "Ab[i16]"} with offset 2`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructLE.fromModelTypes(model, types);
                const buffer = hexToBuffer('7777 0200_FF_01_FE_02');
                const expected = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should read {ab: "s4[i16]"}`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0200_41420000_41424300');
                const expected = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };

                const result = cStruct.read(buffer);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should read {ab: "s4[i16]"} with offset 2`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 0200_41420000_41424300');
                const expected = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };

                const result = cStruct.read(buffer, 2);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });

        describe(`make`, () => {
            it(`should make {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make({r: [0x1234, 0x5678]});
                expect(result.buffer).toEqual(hexToBuffer('0200 3412 7856'));
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should make {r: 's4[i16]'}`, () => {
                const model = {r: 's4[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make({r: ['ab', 'cd']});
                expect(result.buffer).toEqual(hexToBuffer('0200 61620000 63640000'));
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should make {ab: "Ab[i16]"}`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructLE.fromModelTypes(model, types);
                const struct = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };
                const expected = hexToBuffer('0200_FF_01_FE_02');

                const result = cStruct.make(struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should make {ab: "s4[i16]"}`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };
                const expected = hexToBuffer('0200_41420000_41424300');

                const result = cStruct.make(struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should make [i8, i8[2], i8[i16]]`, () => {
                const model = `[i8, i8[2], i8[i16]]`;
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = [
                    0x01,
                    [0x02, 0x03],
                    [0x04, 0x05, 0x06, 0x07],
                ];
                const expected = hexToBuffer('01 02_03 0400_04_05_06_07');

                const result = cStruct.make(struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(9);
                expect(result.size).toBe(9);
            });
        });

        describe(`write`, () => {
            it(`should write {r: 'u16[i16]'}`, () => {
                const model = {r: 'u16[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
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
                const cStruct = CStructLE.fromModelTypes(model);
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
                const cStruct = CStructLE.fromModelTypes(model);
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
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 00000000 00000000');
                const expected = hexToBuffer('0000 0200 61620000 63640000');

                const result = cStruct.write(buffer, {r: ['ab', 'cd']}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });

            it(`should write {ab: "Ab[i16]"}`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructLE.fromModelTypes(model, types);
                const struct = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };
                const buffer = hexToBuffer('0000_00_00_00_00');
                const expected = hexToBuffer('0200_FF_01_FE_02');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });

            it(`should write {ab: "Ab[i16]"} with offset 2`, () => {
                const model = {ab: "Ab[i16]"};
                const types = {Ab: {a: 'i8', b: 'i8'}};
                const cStruct = CStructLE.fromModelTypes(model, types);
                const struct = {
                    ab: [
                        {a: -1, b: +1},
                        {a: -2, b: +2},
                    ]
                };
                const buffer = hexToBuffer('7777 0000_00_00_00_00');
                const expected = hexToBuffer('7777 0200_FF_01_FE_02');

                const result = cStruct.write(buffer, struct, 2);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(6);
            });

            it(`should write {ab: "s4[i16]"}`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };
                const buffer = hexToBuffer('0000_00000000_00000000');
                const expected = hexToBuffer('0200_41420000_41424300');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(10);
            });

            it(`should write {ab: "s4[i16]"} with offset 2`, () => {
                const model = {ab: "s4[i16]"};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {
                    ab: [
                        "AB",
                        "ABC",
                    ]
                };
                const buffer = hexToBuffer('7777 0000_00000000_00000000');
                const expected = hexToBuffer('7777 0200_41420000_41424300');

                const result = cStruct.write(buffer, struct, 2);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(12);
                expect(result.size).toBe(10);
            });
        });
    });
});