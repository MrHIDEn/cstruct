import { CStructBE, CStructLE } from "../src";
import { hexToBuffer } from "./hex-to-buffer.utils";


describe('u64 - unsigned int64', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read 0x123456789ABCDEF0`, () => {
                const buffer = hexToBuffer("123456789ABCDEF0");
                const model = {r: 'u64'};
                const cStruct = new CStructBE<{ r: bigint }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x123456789ABCDEF0n);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read 0x123456789ABCDEF0 with offset 2`, () => {
                const buffer = hexToBuffer("0000 123456789ABCDEF0");
                const model = {r: 'u64'};
                const cStruct = new CStructBE<{ r: bigint }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x123456789ABCDEF0n);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make 0x123456789ABCDEF0`, () => {
                const model = {r: 'u64'};
                const cStruct = new CStructBE<{ r: bigint }>(model);
                const expected = hexToBuffer("123456789ABCDEF0");

                const result = cStruct.make({r: 0x123456789ABCDEF0n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write 0x123456789ABCDEF0`, () => {
                const model = {r: 'u64'};
                const cStruct = new CStructBE<{ r: bigint }>(model);
                const buffer = hexToBuffer("0000000000000000");
                const expected = hexToBuffer("123456789ABCDEF0");

                const result = cStruct.write(buffer, {r: 0x123456789ABCDEF0n});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write 0x123456789ABCDEF0 with offset 2`, () => {
                const model = {r: 'u64'};
                const cStruct = new CStructBE<{ r: bigint }>(model);
                const buffer = hexToBuffer("0000 0000000000000000");
                const expected = hexToBuffer("0000 123456789ABCDEF0");

                const result = cStruct.write(buffer, {r: 0x123456789ABCDEF0n}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read 0x123456789ABCDEF0`, () => {
                const buffer = hexToBuffer("F0DEBC9A78563412");
                const model = {r: 'u64'};
                const cStruct = new CStructLE<{ r: bigint }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(0x123456789ABCDEF0n);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should read 0x123456789ABCDEF0 with offset 2`, () => {
                const buffer = hexToBuffer("0000 F0DEBC9A78563412");
                const model = {r: 'u64'};
                const cStruct = new CStructLE<{ r: bigint }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(0x123456789ABCDEF0n);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });

        describe(`make`, () => {
            it(`should make 0x123456789ABCDEF0`, () => {
                const model = {r: 'u64'};
                const cStruct = new CStructLE<{ r: bigint }>(model);
                const expected = hexToBuffer("F0DEBC9A78563412");

                const result = cStruct.make({r: 0x123456789ABCDEF0n});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });
        });

        describe(`write`, () => {
            it(`should write 0x123456789ABCDEF0`, () => {
                const model = {r: 'u64'};
                const cStruct = new CStructLE<{ r: bigint }>(model);
                const buffer = hexToBuffer("0000000000000000");
                const expected = hexToBuffer("F0DEBC9A78563412");

                const result = cStruct.write(buffer, {r: 0x123456789ABCDEF0n});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should write 0x123456789ABCDEF0 with offset 2`, () => {
                const model = {r: 'u64'};
                const cStruct = new CStructLE<{ r: bigint }>(model);
                const buffer = hexToBuffer("0000 0000000000000000");
                const expected = hexToBuffer("0000 F0DEBC9A78563412");

                const result = cStruct.write(buffer, {r: 0x123456789ABCDEF0n}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });
        });
    });
});