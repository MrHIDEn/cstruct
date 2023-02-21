import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('dynamic string', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {r.string: number, r: string}`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructBE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0003 616263');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should read {r.string: number, r: string} with offset 2`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructBE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 0003 616263');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });

        describe(`make`, () => {
            it(`should make {r.string: number, r: string}`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructBE<{ r: string }>(model);

                const result = cStruct.make({r: 'abc'});
                expect(result.buffer).toEqual(hexToBuffer('0003 616263'));
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });
        });

        describe(`write`, () => {
            it(`should write {r.string: number, r: string}`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructBE<{ r: string }>(model);
                const buffer = hexToBuffer('0000 000000');
                const expected = hexToBuffer('0003 616263');

                const result = cStruct.write(buffer, {r: 'abc'});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should write {r.string: number, r: string} with offset 2`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructBE<{ r: string }>(model);
                const buffer = hexToBuffer('0000 0000 000000');
                const expected = hexToBuffer('0000 0003 616263');

                const result = cStruct.write(buffer, {r: 'abc'}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {r.string: number, r: string}`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructLE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0300 616263');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should read {r.string: number, r: string} with offset 2`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructLE<{ r: string[] }>(model);
                const buffer = hexToBuffer('0000 0300 616263');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });

        describe(`make`, () => {
            it(`should make {r.string: number, r: string}`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructLE<{ r: string }>(model);

                const result = cStruct.make({r: 'abc'});
                expect(result.buffer).toEqual(hexToBuffer('0300 616263'));
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });
        });

        describe(`write`, () => {
            it(`should write {r.string: number, r: string}`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructLE<{ r: string }>(model);
                const buffer = hexToBuffer('0000 000000');
                const expected = hexToBuffer('0300 616263');

                const result = cStruct.write(buffer, {r: 'abc'});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should write {r.string: number, r: string} with offset 2`, () => {
                const model = {'r.string': 'i16', r: 'string'};
                const cStruct = new CStructLE<{ r: string }>(model);
                const buffer = hexToBuffer('0000 0000 000000');
                const expected = hexToBuffer('0000 0300 616263');

                const result = cStruct.write(buffer, {r: 'abc'}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });
        });
    });
});