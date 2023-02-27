import { hexToBuffer, CStructBE, CStructLE } from "../src/tests";


describe('i16 - signed int16', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read -292`, () => {
                const buffer = hexToBuffer("FEDC");
                const model = {r: 'i16'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-292);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read -292 with offset 2`, () => {
                const buffer = hexToBuffer("0000 FEDC");
                const model = {r: 'i16'};
                const cStruct = new CStructBE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-292);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });

        describe(`make`, () => {
            it(`should make 0xFEDC`, () => {
                const model = {r: 'i16'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const expected = hexToBuffer("FEDC");

                const result = cStruct.make({r: -292});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write 0xFEDC`, () => {
                const model = {r: 'i16'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = hexToBuffer("0000");
                const expected = hexToBuffer("FEDC");

                const result = cStruct.write(buffer, {r: -292});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 0xFEDC with offset 2`, () => {
                const model = {r: 'i16'};
                const cStruct = new CStructBE<{ r: number }>(model);
                const buffer = hexToBuffer("0000 0000");
                const expected = hexToBuffer("0000 FEDC");

                const result = cStruct.write(buffer, {r: -292}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read -292`, () => {
                const buffer = hexToBuffer("DCFE");
                const model = {r: 'i16'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-292);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should read -292 with offset 2`, () => {
                const buffer = hexToBuffer("0000 DCFE");
                const model = {r: 'i16'};
                const cStruct = new CStructLE<{ r: number }>(model);

                const result = cStruct.read(buffer, 2);
                expect(result.struct.r).toBe(-292);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });

        describe(`make`, () => {
            it(`should make 0xDCFE`, () => {
                const model = {r: 'i16'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const expected = hexToBuffer("DCFE");

                const result = cStruct.make({r: -292});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write 0xDCFE`, () => {
                const model = {r: 'i16'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = hexToBuffer("0000");
                const expected = hexToBuffer("DCFE");

                const result = cStruct.write(buffer, {r: -292});
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it(`should write 0xDCFE with offset 2`, () => {
                const model = {r: 'i16'};
                const cStruct = new CStructLE<{ r: number }>(model);
                const buffer = hexToBuffer("0000 0000");
                const expected = hexToBuffer("0000 DCFE");

                const result = cStruct.write(buffer, {r: -292}, 2);
                expect(buffer).toEqual(expected);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(2);
            });
        });
    });
});