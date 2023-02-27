import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('b16 - boolean', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'true', b16`, () => {
                const buffer = hexToBuffer('0001');
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read 'false', b16`, () => {
                const buffer = hexToBuffer('0000');
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read 'true' with offset 2, b16`, () => {
                const buffer = hexToBuffer('0000 0001');
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });

            it(`should read 'false' with offset 2, b16`, () => {
                const buffer = hexToBuffer('0000 0000');
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const expected = hexToBuffer('0001');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make 'false', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const expected = hexToBuffer('0000');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000');
                const expected = hexToBuffer('0001');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 'false', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0001');
                const expected = hexToBuffer('0000');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 'true' with offset 2, b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 0000');
                const expected = hexToBuffer('0000 0001');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });

            it(`should write 'false' with offset 2, b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 0001');
                const expected = hexToBuffer('0000 0000');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'true', b16`, () => {
                const buffer = hexToBuffer('0001');
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read 'false', b16`, () => {
                const buffer = hexToBuffer('0000');
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read 'true' with offset 2, b16`, () => {
                const buffer = hexToBuffer('0000 0001');
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });

            it(`should read 'false' with offset 2, b16`, () => {
                const buffer = hexToBuffer('0000 0000');
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const expected = hexToBuffer('0100');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should make 'false', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const expected = hexToBuffer('0000');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000');
                const expected = hexToBuffer('0100');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 'false', b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0100');
                const expected = hexToBuffer('0000');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 'true' with offset 2, b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 0000');
                const expected = hexToBuffer('0000 0100');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });

            it(`should write 'false' with offset 2, b16`, () => {
                const model = {r: 'b16'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 0100');
                const expected = hexToBuffer('0000 0000');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });
    });
});