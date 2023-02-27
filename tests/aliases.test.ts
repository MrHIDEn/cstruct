import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('Aliases', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {uu: 'UU', b2: 'B2', ii: 'II'}`, () => {
                const model = {uu: 'UU', b2: 'B2', ii: 'II'};
                const aliases = [
                    ['u16', 'UU', 'B2'],
                    ['i16', 'II'],
                ];
                const cStruct = new CStructBE(model, null, aliases);
                const buffer = hexToBuffer('1234 5678 FFFA');
                const expected = {uu: 0x1234, b2: 0x5678, ii: -6};

                const result = cStruct.read(buffer);
                expect(result.struct).toStrictEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });
        });

        describe(`make`, () => {
            it(`should make {uu: 'UU', b2: 'B2', ii: 'II'}`, () => {
                const model = {uu: 'UU', b2: 'B2', ii: 'II'};
                const aliases = [
                    ['u16', 'UU', 'B2'],
                    ['i16', 'II'],
                ];
                const cStruct = new CStructBE(model, null, aliases);
                const struct = {uu: 0x1234, b2: 0x5678, ii: -6};
                const expected = hexToBuffer('1234 5678 FFFA');

                const result = cStruct.make(struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });
        });

        describe(`write`, () => {
            it(`should write {uu: 'UU', b2: 'B2', ii: 'II'}`, () => {
                const model = {uu: 'UU', b2: 'B2', ii: 'II'};
                const aliases = [
                    ['u16', 'UU', 'B2'],
                    ['i16', 'II'],
                ];
                const cStruct = new CStructBE(model, null, aliases);
                const struct = {uu: 0x1234, b2: 0x5678, ii: -6};
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('1234 5678 FFFA');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {uu: 'UU', b2: 'B2', ii: 'II'}`, () => {
                const model = {uu: 'UU', b2: 'B2', ii: 'II'};
                const aliases = [
                    ['u16', 'UU', 'B2'],
                    ['i16', 'II'],
                ];
                const cStruct = new CStructLE(model, null, aliases);
                const buffer = hexToBuffer('3412 7856 FAFF');
                const expected = {uu: 0x1234, b2: 0x5678, ii: -6};

                const result = cStruct.read(buffer);
                expect(result.struct).toStrictEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });
        });

        describe(`make`, () => {
            it(`should make {uu: 'UU', b2: 'B2', ii: 'II'}`, () => {
                const model = {uu: 'UU', b2: 'B2', ii: 'II'};
                const aliases = [
                    ['u16', 'UU', 'B2'],
                    ['i16', 'II'],
                ];
                const cStruct = new CStructLE(model, null, aliases);
                const struct = {uu: 0x1234, b2: 0x5678, ii: -6};
                const expected = hexToBuffer('3412 7856 FAFF');

                const result = cStruct.make(struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });
        });

        describe(`write`, () => {
            it(`should write {uu: 'UU', b2: 'B2', ii: 'II'}`, () => {
                const model = {uu: 'UU', b2: 'B2', ii: 'II'};
                const aliases = [
                    ['u16', 'UU', 'B2'],
                    ['i16', 'II'],
                ];
                const cStruct = new CStructLE(model, null, aliases);
                const struct = {uu: 0x1234, b2: 0x5678, ii: -6};
                const buffer = hexToBuffer('0000 0000 0000');
                const expected = hexToBuffer('3412 7856 FAFF');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(6);
            });
        });
    });
});