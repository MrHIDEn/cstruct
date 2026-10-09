import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('dynamic string', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {r: 'string[i16]'}`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0003 616263');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should read {r: 'string[i16]'} with offset 2`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0003 616263');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });

            it(`should read {r: 'wstring[i16]'}`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0003 610062006300');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read {r: 'wstring[i16]'} with offset 2`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0003 610062006300');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make {r: 'string[i16]'}`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({r: 'abc'});
                expect(result.buffer).toEqual(hexToBuffer('0003 616263'));
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should make {r: 'wstring[i16]'}`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({r: 'abc'});
                expect(result.buffer).toEqual(hexToBuffer('0003 610062006300'));
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write {r: 'string[i16]'}`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 000000');
                const expected = hexToBuffer('0003 616263');

                const result = cStruct.write(buffer, {r: 'abc'});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should write {r: 'string[i16]'} with offset 2`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 000000');
                const expected = hexToBuffer('0000 0003 616263');

                const result = cStruct.write(buffer, {r: 'abc'}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });

            it(`should write {r: 'wstring[i16]'}`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 000000000000');
                const expected = hexToBuffer('0003 610062006300');

                const result = cStruct.write(buffer, {r: 'abc'});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write {r: 'wstring[i16]'} with offset 2`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 000000000000');
                const expected = hexToBuffer('0000 0003 610062006300');

                const result = cStruct.write(buffer, {r: 'abc'}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {r: 'string[i16]'}`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0300 616263');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should read {r: 'string[i16]'} with offset 2`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0300 616263');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });

            it(`should read {r: 'wstring[i16]'}`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0300 610062006300');

                const result = cStruct.read(buffer);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read {r: 'wstring[i16]'} with offset 2`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0300 610062006300');

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toStrictEqual('abc');
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make {r: 'string[i16]'}`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make({r: 'abc'});
                expect(result.buffer).toEqual(hexToBuffer('0300 616263'));
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should make {r: 'wstring[i16]'}`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.make({r: 'abc'});
                expect(result.buffer).toEqual(hexToBuffer('0300 610062006300'));
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write {r: 'string[i16]'}`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 000000');
                const expected = hexToBuffer('0300 616263');

                const result = cStruct.write(buffer, {r: 'abc'});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(5);
            });

            it(`should write {r: 'string[i16]'} with offset 2`, () => {
                const model = {r: 'string[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 000000');
                const expected = hexToBuffer('0000 0300 616263');

                const result = cStruct.write(buffer, {r: 'abc'}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(7);
                expect(result.size).toBe(5);
            });

            it(`should write {r: 'wstring[i16]'}`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 000000000000');
                const expected = hexToBuffer('0300 610062006300');

                const result = cStruct.write(buffer, {r: 'abc'});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write {r: 'wstring[i16]'} with offset 2`, () => {
                const model = {r: 'wstring[i16]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000 000000000000');
                const expected = hexToBuffer('0000 0300 610062006300');

                const result = cStruct.write(buffer, {r: 'abc'}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });
});

describe('dynamic string multibyte (UTF-8)', () => {
    it(`should make a multibyte string with a UTF-8 byte length prefix`, () => {
        const model = { r: 'string[i16]' };
        const cStruct = CStructLE.fromModelTypes(model);

        const result = cStruct.make({ r: 'ąę' });
        // 'ąę' = 2 chars but 4 UTF-8 bytes — the prefix must be 4, not 2
        expect(result.buffer).toEqual(hexToBuffer('0400 c485c499'));
        expect(result.offset).toBe(6);
        expect(result.size).toBe(6);
    });

    it(`should read back a multibyte string without truncation`, () => {
        const model = { r: 'string[i16]' };
        const cStruct = CStructLE.fromModelTypes(model);

        const result = cStruct.read(hexToBuffer('0400 c485c499'));
        expect(result.struct.r).toStrictEqual('ąę');
        expect(result.offset).toBe(6);
    });

    it(`should round-trip a multibyte string via codegen (incl. astral char)`, () => {
        const model = { r: 'string[i16]' };
        const cStruct = CStructLE.fromModelTypes(model);
        const makeFn = cStruct.compileMake();
        const readFn = cStruct.compileRead();

        const made = makeFn({ r: 'ąę🚀' });
        // 'ąę🚀' = 8 UTF-8 bytes
        expect(made.buffer).toEqual(hexToBuffer('0800 c485c499 f09f9a80'));

        const readBack = readFn(made.buffer).struct;
        expect(readBack.r).toStrictEqual('ąę🚀');
    });
});