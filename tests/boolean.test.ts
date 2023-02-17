import { CStructBE, CStructLE } from "../src/tests";


describe('boolean', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 'true'`, () => {
                const buffer = Buffer.from([0x01]);
                const model = {r: 'b'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'false'`, () => {
                const buffer = Buffer.from([0x00]);
                const model = {r: 'b'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'true' with offset 2`, () => {
                const buffer = Buffer.from([0x00,0x00,0x01]);
                const model = {r: 'b'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });

            it(`should read 'false' with offset 2`, () => {
                const buffer = Buffer.from([0x01,0x01,0x00]);
                const model = {r: 'b'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 'true'`, () => {
                const model = {r: 'b'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(Buffer.from([0x01]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'false'`, () => {
                const model = {r: 'b'};
                const cStruct = new CStructBE<{ r: boolean }>(model);

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(Buffer.from([0x00]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 'true'`, () => {
                const buffer = Buffer.from([0x01]);
                const model = {r: 'b'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'false'`, () => {
                const buffer = Buffer.from([0x00]);
                const model = {r: 'b'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'true' with offset 2`, () => {
                const buffer = Buffer.from([0x00,0x00,0x01]);
                const model = {r: 'b'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(true);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });

            it(`should read 'false' with offset 2`, () => {
                const buffer = Buffer.from([0x01,0x01,0x00]);
                const model = {r: 'b'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(false);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 'true'`, () => {
                const model = {r: 'b'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.make({r: true});
                expect(result.buffer).toEqual(Buffer.from([0x01]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 'false'`, () => {
                const model = {r: 'b'};
                const cStruct = new CStructLE<{ r: boolean }>(model);

                const result = cStruct.make({r: false});
                expect(result.buffer).toEqual(Buffer.from([0x00]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });
    });
});