import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('b32 - boolean', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'true', b32`, () => {
                const buffer = hexToBuffer('00000001');
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 'false', b32`, () => {
                const buffer = hexToBuffer('00000000');
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 'true' with offset 2, b32`, () => {
                const buffer = hexToBuffer('0000 00000001');
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read 'false' with offset 2, b32`, () => {
                const buffer = hexToBuffer('0000 00000000');
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const expected = hexToBuffer('00000001');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make 'false', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const expected = hexToBuffer('00000000');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('00000000');
                const expected = hexToBuffer('00000001');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write 'false', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('00000001');
                const expected = hexToBuffer('00000000');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write 'true' with offset 2, b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 00000000');
                const expected = hexToBuffer('0000 00000001');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write 'false' with offset 2, b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 00000001');
                const expected = hexToBuffer('0000 00000000');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'true', b32`, () => {
                const buffer = hexToBuffer('00000001');
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 'false', b32`, () => {
                const buffer = hexToBuffer('00000000');
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 'true' with offset 2, b32`, () => {
                const buffer = hexToBuffer('0000 00000001');
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read 'false' with offset 2, b32`, () => {
                const buffer = hexToBuffer('0000 00000000');
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const expected = hexToBuffer('01000000');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make 'false', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const expected = hexToBuffer('00000000');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('00000000');
                const expected = hexToBuffer('01000000');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write 'false', b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('01000000');
                const expected = hexToBuffer('00000000');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write 'true' with offset 2, b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 00000000');
                const expected = hexToBuffer('0000 01000000');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write 'false' with offset 2, b32`, () => {
                const model = {r: 'b32'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 01000000');
                const expected = hexToBuffer('0000 00000000');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });
});