import { CStructBE, CStructLE } from "../src/tests";


describe('u8 - unsigned char', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 0x12`, () => {
                const buffer = Buffer.from([0x12]);
                const model = {r: 'u8'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x12);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 0x12 with offset 2`, () => {
                const buffer = Buffer.from([0x00, 0x00, 0x12]);
                const model = {r: 'u8'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x12);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 0x12`, () => {
                const model = {r: 'u8'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.make({r: 0x12});
                expect(result.buffer).toEqual(Buffer.from([0x12]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12`, () => {
                const model = {r: 'u8'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = Buffer.from([0x00]);

                const result = cStruct.write(buffer, {r: 0x12});
                expect(buffer).toEqual(Buffer.from([0x12]));
                expect(result.buffer).toEqual(Buffer.from([0x12]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 0x12 with offset 2`, () => {
                const model = {r: 'u8'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = Buffer.from([0x00, 0x00, 0x00]);

                const result = cStruct.write(buffer, {r: 0x12}, 2);
                expect(buffer).toEqual(Buffer.from([0x00, 0x00, 0x12]));
                expect(result.buffer).toEqual(Buffer.from([0x00, 0x00, 0x12]));
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 0x12`, () => {
                const buffer = Buffer.from([0x12]);
                const model = {r: 'u8'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x12);
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should read 0x12 with offset 2`, () => {
                const buffer = Buffer.from([0x00, 0x00, 0x12]);
                const model = {r: 'u8'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x12);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });

        describe(`make`, () => {
            it(`should make 0x12`, () => {
                const model = {r: 'u8'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.make({r: 0x12});
                expect(result.buffer).toEqual(Buffer.from([0x12]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });
        });

        describe(`write`, () => {
            it(`should write 0x12`, () => {
                const model = {r: 'u8'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = Buffer.from([0x00]);

                const result = cStruct.write(buffer, {r: 0x12});
                expect(buffer).toEqual(Buffer.from([0x12]));
                expect(result.buffer).toEqual(Buffer.from([0x12]));
                expect(result.offset).toBe(1);
                expect(result.size).toBe(1);
            });

            it(`should write 0x12 with offset 2`, () => {
                const model = {r: 'u8'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = Buffer.from([0x00, 0x00, 0x00]);

                const result = cStruct.write(buffer, {r: 0x12}, 2);
                expect(buffer).toEqual(Buffer.from([0x00, 0x00, 0x12]));
                expect(result.buffer).toEqual(Buffer.from([0x00, 0x00, 0x12]));
                expect(result.offset).toBe(3);
                expect(result.size).toBe(1);
            });
        });
    });
});