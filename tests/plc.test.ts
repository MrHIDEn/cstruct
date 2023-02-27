import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('Aliases', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {b: 'BYTE', w: 'WORD', f: 'BOOL'}`, () => {
                const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};
                const cStruct = new CStructBE(model);
                const buffer = hexToBuffer('12 3456 01');
                const expected = {b: 0x12, w: 0x3456, f: true};

                const result = cStruct.read(buffer);
                expect(result.struct).toStrictEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make {b: 'BYTE', w: 'WORD', f: 'BOOL'}`, () => {
                const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};
                const cStruct = new CStructBE(model);
                const struct = {b: 0x12, w: 0x3456, f: true};
                const expected = hexToBuffer('12 3456 01');

                const result = cStruct.make(struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write {b: 'BYTE', w: 'WORD', f: 'BOOL'}`, () => {
                const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};
                const cStruct = new CStructBE(model);
                const struct = {b: 0x12, w: 0x3456, f: true};
                const buffer = hexToBuffer('00 0000 00');
                const expected = hexToBuffer('12 3456 01');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {b: 'BYTE', w: 'WORD', f: 'BOOL'}`, () => {
                const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};
                const cStruct = new CStructLE(model);
                const buffer = hexToBuffer('12 5634 01');
                const expected = {b: 0x12, w: 0x3456, f: true};

                const result = cStruct.read(buffer);
                expect(result.struct).toStrictEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make {b: 'BYTE', w: 'WORD', f: 'BOOL'}`, () => {
                const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};
                const cStruct = new CStructLE(model);
                const struct = {b: 0x12, w: 0x3456, f: true};
                const expected = hexToBuffer('12 5634 01');

                const result = cStruct.make(struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write {b: 'BYTE', w: 'WORD', f: 'BOOL'}`, () => {
                const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};
                const cStruct = new CStructLE(model);
                const struct = {b: 0x12, w: 0x3456, f: true};
                const buffer = hexToBuffer('00 0000 00');
                const expected = hexToBuffer('12 5634 01');

                const result = cStruct.write(buffer, struct);
                expect(result.buffer).toStrictEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });
    });
});