import {
    CStructBE, CStructLE, hexToBuffer,
    BOOL, B8, B16, B32, B64,
    U8, U16, U32, U64, BYTE, WORD, DWORD, QWORD,
    I8, I16, I32, I64, CHAR, INT, DINT, QINT,
    F, F32, REAL, D, F64, LREAL,
    S, BUF, J,
} from "../src";

describe('atom types', () => {
    describe('BE', () => {
        describe('bool types', () => {
            it(`should make BOOL`, () => {
                const cStruct = CStructBE.from({
                    model: {r: BOOL},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make B8`, () => {
                const cStruct = CStructBE.from({
                    model: {r: B8},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make B16`, () => {
                const cStruct = CStructBE.from({
                    model: {r: B16},
                });
                const expected = hexToBuffer("0001");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make B32`, () => {
                const cStruct = CStructBE.from({
                    model: {r: B32},
                });
                const expected = hexToBuffer("00000001");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make B64`, () => {
                const cStruct = CStructBE.from({
                    model: {r: B64},
                });
                const expected = hexToBuffer("0000000000000001");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            })
        });

        describe('signed types', () => {
            it(`should make U8`, () => {
                const cStruct = CStructBE.from({
                    model: {r: U8},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make U16`, () => {
                const cStruct = CStructBE.from({
                    model: {r: U16},
                });
                const expected = hexToBuffer("0001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make U32`, () => {
                const cStruct = CStructBE.from({
                    model: {r: U32},
                });
                const expected = hexToBuffer("00000001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make U64`, () => {
                const cStruct = CStructBE.from({
                    model: {r: U64},
                });
                const expected = hexToBuffer("0000000000000001");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make BYTE`, () => {
                const cStruct = CStructBE.from({
                    model: {r: BYTE},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make WORD`, () => {
                const cStruct = CStructBE.from({
                    model: {r: WORD},
                });
                const expected = hexToBuffer("0001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make DWORD`, () => {
                const cStruct = CStructBE.from({
                    model: {r: DWORD},
                });
                const expected = hexToBuffer("00000001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make QWORD`, () => {
                const cStruct = CStructBE.from({
                    model: {r: QWORD},
                });
                const expected = hexToBuffer("0000000000000001");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe('unsigned types', () => {
            it(`should make I8`, () => {
                const cStruct = CStructBE.from({
                    model: {r: I8},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make I16`, () => {
                const cStruct = CStructBE.from({
                    model: {r: I16},
                });
                const expected = hexToBuffer("0001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make I32`, () => {
                const cStruct = CStructBE.from({
                    model: {r: I32},
                });
                const expected = hexToBuffer("00000001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make I64`, () => {
                const cStruct = CStructBE.from({
                    model: {r: I64},
                });
                const expected = hexToBuffer("0000000000000001");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make CHAR`, () => {
                const cStruct = CStructBE.from({
                    model: {r: CHAR},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make INT`, () => {
                const cStruct = CStructBE.from({
                    model: {r: INT},
                });
                const expected = hexToBuffer("0001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make DINT`, () => {
                const cStruct = CStructBE.from({
                    model: {r: DINT},
                });
                const expected = hexToBuffer("00000001");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make QINT`, () => {
                const cStruct = CStructBE.from({
                    model: {r: QINT},
                });
                const expected = hexToBuffer("0000000000000001");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe('float types', () => {
            it(`should make F`, () => {
                const cStruct = CStructBE.from({
                    model: {r: F},
                });
                const expected = hexToBuffer("3f800000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make F32`, () => {
                const cStruct = CStructBE.from({
                    model: {r: F32},
                });
                const expected = hexToBuffer("3f800000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make REAL`, () => {
                const cStruct = CStructBE.from({
                    model: {r: REAL},
                });
                const expected = hexToBuffer("3f800000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make D`, () => {
                const cStruct = CStructBE.from({
                    model: {r: D},
                });
                const expected = hexToBuffer("3ff0000000000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make F64`, () => {
                const cStruct = CStructBE.from({
                    model: {r: F64},
                });
                const expected = hexToBuffer("3ff0000000000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make LREAL`, () => {
                const cStruct = CStructBE.from({
                    model: {r: LREAL},
                });
                const expected = hexToBuffer("3ff0000000000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe('dynamic types', () => {
            it(`should make S, STR, STRING - static length by size`, () => {
                const cStruct = CStructBE.from({
                    model: {r: S(3)},
                });
                const expected = hexToBuffer("414243");

                const result = cStruct.make({r: "ABC"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make S, STR, STRING - dynamic length by size`, () => {
                const cStruct = CStructBE.from({
                    model: {r: S(INT)},
                });
                const expected = hexToBuffer("0003414243");

                const result = cStruct.make({r: "ABC"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should make S, STR, STRING - dynamic length by trailing zero`, () => {
                const cStruct = CStructBE.from({
                    model: {r: S(0)},
                });
                const expected = hexToBuffer("41424300");

                const result = cStruct.make({r: "ABC"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make BUF, BUFFER`, () => {
                const cStruct = CStructBE.from({
                    model: {r: BUF(3)},
                });
                const expected = hexToBuffer("010203");

                const result = cStruct.make({r: Buffer.from([1, 2, 3])});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make J, JSON - dynamic length by size`, () => {
                const cStruct = CStructBE.from({
                    model: {r: J(INT)},
                });
                const expected = hexToBuffer("000d7b2261223a312c2262223a327d");

                const result = cStruct.make({r: {a: 1, b: 2}});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(15);
                expect(result.size).toBe(15);
            });

            it(`should make J, JSON - dynamic length by trailing zero`, () => {
                const cStruct = CStructBE.from({
                    model: {r: J(0)},
                });
                const expected = hexToBuffer("7b2261223a312c2262223a327d00");

                const result = cStruct.make({r: {a: 1, b: 2}});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(14);
                expect(result.size).toBe(14);
            });
        });
    });


    describe('LE', () => {
        describe('bool types', () => {
            it(`should make BOOL`, () => {
                const cStruct = CStructLE.from({
                    model: {r: BOOL},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make B8`, () => {
                const cStruct = CStructLE.from({
                    model: {r: B8},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make B16`, () => {
                const cStruct = CStructLE.from({
                    model: {r: B16},
                })
                const expected = hexToBuffer("0100");

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe('signed types', () => {
            it(`should make U8`, () => {
                const cStruct = CStructLE.from({
                    model: {r: U8},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make U16`, () => {
                const cStruct = CStructLE.from({
                    model: {r: U16},
                });
                const expected = hexToBuffer("0100");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make U32`, () => {
                const cStruct = CStructLE.from({
                    model: {r: U32},
                });
                const expected = hexToBuffer("01000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make U64`, () => {
                const cStruct = CStructLE.from({
                    model: {r: U64},
                });
                const expected = hexToBuffer("0100000000000000");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make BYTE`, () => {
                const cStruct = CStructLE.from({
                    model: {r: BYTE},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(1);
                expect(result.size).toEqual(1);
            });

            it(`should make WORD`, () => {
                const cStruct = CStructLE.from({
                    model: {r: WORD},
                });
                const expected = hexToBuffer("0100");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(2);
                expect(result.size).toEqual(2);
            });

            it(`should make DWORD`, () => {
                const cStruct = CStructLE.from({
                    model: {r: DWORD},
                });
                const expected = hexToBuffer("01000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(4);
                expect(result.size).toEqual(4);
            });

            it(`should make QWORD`, () => {
                const cStruct = CStructLE.from({
                    model: {r: QWORD},
                });
                const expected = hexToBuffer("0100000000000000");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(8);
                expect(result.size).toEqual(8);
            });
        });

        describe('unsigned types', () => {
            it(`should make I8`, () => {
                const cStruct = CStructLE.from({
                    model: {r: I8},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(1);
                expect(result.size).toEqual(1);
            });

            it(`should make I16`, () => {
                const cStruct = CStructLE.from({
                    model: {r: I16},
                });
                const expected = hexToBuffer("0100");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(2);
                expect(result.size).toEqual(2);
            });

            it(`should make I32`, () => {
                const cStruct = CStructLE.from({
                    model: {r: I32},
                });
                const expected = hexToBuffer("01000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(4);
                expect(result.size).toEqual(4);
            });

            it(`should make I64`, () => {
                const cStruct = CStructLE.from({
                    model: {r: I64},
                });
                const expected = hexToBuffer("0100000000000000");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(8);
                expect(result.size).toEqual(8);
            });

            it(`should make CHAR`, () => {
                const cStruct = CStructLE.from({
                    model: {r: CHAR},
                });
                const expected = hexToBuffer("01");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(1);
                expect(result.size).toEqual(1);
            });

            it(`should make INT`, () => {
                const cStruct = CStructLE.from({
                    model: {r: INT},
                });
                const expected = hexToBuffer("0100");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(2);
                expect(result.size).toEqual(2);
            });

            it(`should make DINT`, () => {
                const cStruct = CStructLE.from({
                    model: {r: DINT},
                });
                const expected = hexToBuffer("01000000");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(4);
                expect(result.size).toEqual(4);
            });

            it(`should make QINT`, () => {
                const cStruct = CStructLE.from({
                    model: {r: QINT},
                });
                const expected = hexToBuffer("0100000000000000");

                const result = cStruct.make({r: 1n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(8);
                expect(result.size).toEqual(8);
            });
        });

        describe('float types', () => {
            it(`should make F`, () => {
                const cStruct = CStructLE.from({
                    model: {r: F},
                });
                const expected = hexToBuffer("0000803f");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(4);
                expect(result.size).toEqual(4);
            });

            it(`should make F32`, () => {
                const cStruct = CStructLE.from({
                    model: {r: F32},
                });
                const expected = hexToBuffer("0000803f");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(4);
                expect(result.size).toEqual(4);
            });

            it(`should make REAL`, () => {
                const cStruct = CStructLE.from({
                    model: {r: REAL},
                });
                const expected = hexToBuffer("0000803f");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(4);
                expect(result.size).toEqual(4);
            });

            it(`should make D`, () => {
                const cStruct = CStructLE.from({
                    model: {r: D},
                });
                const expected = hexToBuffer("000000000000f03f");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(8);
                expect(result.size).toEqual(8);
            });

            it(`should make F64`, () => {
                const cStruct = CStructLE.from({
                    model: {r: F64},
                });
                const expected = hexToBuffer("000000000000f03f");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(8);
                expect(result.size).toEqual(8);
            });

            it(`should make LREAL`, () => {
                const cStruct = CStructLE.from({
                    model: {r: LREAL},
                });
                const expected = hexToBuffer("000000000000f03f");

                const result = cStruct.make({r: 1});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toEqual(8);
                expect(result.size).toEqual(8);
            });
        });

        describe('dynamic types', () => {
            it(`should make S, STR, STRING - static length by size`, () => {
                const cStruct = CStructLE.from({
                    model: {r: S(3)},
                });
                const expected = hexToBuffer("414243");

                const result = cStruct.make({r: "ABC"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make S, STR, STRING - dynamic length by size`, () => {
                const cStruct = CStructLE.from({
                    model: {r: S(INT)},
                });
                const expected = hexToBuffer("0300414243");

                const result = cStruct.make({r: "ABC"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should make S, STR, STRING - dynamic length by trailing zero`, () => {
                const cStruct = CStructLE.from({
                    model: {r: S(0)},
                });
                const expected = hexToBuffer("41424300");

                const result = cStruct.make({r: "ABC"});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make BUF, BUFFER`, () => {
                const cStruct = CStructLE.from({
                    model: {r: BUF(3)},
                });
                const expected = hexToBuffer("010203");

                const result = cStruct.make({r: Buffer.from([1, 2, 3])});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make J, JSON - dynamic length by size`, () => {
                const cStruct = CStructLE.from({
                    model: {r: J(INT)},
                });
                const expected = hexToBuffer("0d007b2261223a312c2262223a327d");

                const result = cStruct.make({r: {a: 1, b: 2}});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(15);
                expect(result.size).toBe(15);
            });

            it(`should make J, JSON - dynamic length by trailing zero`, () => {
                const cStruct = CStructLE.from({
                    model: {r: J(0)},
                });
                const expected = hexToBuffer("7b2261223a312c2262223a327d00");

                const result = cStruct.make({r: {a: 1, b: 2}});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(14);
                expect(result.size).toBe(14);
            });
        });
    });
});