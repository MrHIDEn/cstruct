import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('b8 - boolean', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'true', b8`, () => {
                const buffer = hexToBuffer('01');
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'false', b8`, () => {
                const buffer = hexToBuffer('00');
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'true' with offset 2, b8`, () => {
                const buffer = hexToBuffer('0000 01');
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });

            it(`should read 'false' with offset 2, b8`, () => {
                const buffer = hexToBuffer('0000 00');
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const expected = hexToBuffer('01');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make 'false', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const expected = hexToBuffer('00');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('00');
                const expected = hexToBuffer('01');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 'false', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('01');
                const expected = hexToBuffer('00');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 'true' with offset 2, b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 00');
                const expected = hexToBuffer('0000 01');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });

            it(`should write 'false' with offset 2, b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructBE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 01');
                const expected = hexToBuffer('0000 00');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'true', b8`, () => {
                const buffer = hexToBuffer('01');
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'false', b8`, () => {
                const buffer = hexToBuffer('00');
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'true' with offset 2, b8`, () => {
                const buffer = hexToBuffer('0000 01');
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });

            it(`should read 'false' with offset 2, b8`, () => {
                const buffer = hexToBuffer('0000 00');
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const expected = hexToBuffer('01');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should make 'false', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const expected = hexToBuffer('00');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('00');
                const expected = hexToBuffer('01');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 'false', b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('01');
                const expected = hexToBuffer('00');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 'true' with offset 2, b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 00');
                const expected = hexToBuffer('0000 01');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });

            it(`should write 'false' with offset 2, b8`, () => {
                const model = {r: 'b8'};
                const cStruct = new CStructLE<{ r: boolean }>(model);
                const buffer = hexToBuffer('0000 01');
                const expected = hexToBuffer('0000 00');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });
    });
});