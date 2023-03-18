import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";

describe('b64 - boolean', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'true', b64`, () => {
                const buffer = hexToBuffer('0000000000000001');
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read 'false', b64`, () => {
                const buffer = hexToBuffer('0000000000000000');
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read 'true' with offset 2, b64`, () => {
                const buffer = hexToBuffer('0000 0000000000000001');
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should read 'false' with offset 2, b64`, () => {
                const buffer = hexToBuffer('0000 0000000000000000');
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer('0000000000000001');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make 'false', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const expected = hexToBuffer('0000000000000000');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000000000000000');
                const expected = hexToBuffer('0000000000000001');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write 'false', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000000000000001');
                const expected = hexToBuffer('0000000000000000');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write 'true' with offset 2, b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000000000000000');
                const expected = hexToBuffer('0000 0000000000000001');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should write 'false' with offset 2, b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000000000000001');
                const expected = hexToBuffer('0000 0000000000000000');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'true', b64`, () => {
                const buffer = hexToBuffer('0000000000000001');
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read 'false', b64`, () => {
                const buffer = hexToBuffer('0000000000000000');
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read 'true' with offset 2, b64`, () => {
                const buffer = hexToBuffer('0000 0000000000000001');
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should read 'false' with offset 2, b64`, () => {
                const buffer = hexToBuffer('0000 0000000000000000');
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make 'true', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer('0100000000000000');

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make 'false', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const expected = hexToBuffer('0000000000000000');

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write 'true', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000000000000000');
                const expected = hexToBuffer('0100000000000000');

                const result = cStruct.write(buffer, {r: true});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write 'false', b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0100000000000000');
                const expected = hexToBuffer('0000000000000000');

                const result = cStruct.write(buffer, {r: false});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write 'true' with offset 2, b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0000000000000000');
                const expected = hexToBuffer('0000 0100000000000000');

                const result = cStruct.write(buffer, {r: true}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should write 'false' with offset 2, b64`, () => {
                const model = {r: 'b64'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('0000 0100000000000000');
                const expected = hexToBuffer('0000 0000000000000000');

                const result = cStruct.write(buffer, {r: false}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });
});