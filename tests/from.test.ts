import { CStructBE, CStructLE, hexToBuffer } from "../src";

describe('from, fromModelTypes', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read -19088744 with "fromModelTypes"`, () => {
                const buffer = hexToBuffer("FEDCBA98");
                const model = {r: 'i32'};
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read -19088744 with "from"`, () => {
                const buffer = hexToBuffer("FEDCBA98");
                const cStruct = CStructBE.from({
                    model: {r: 'i32'}
                });

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 10, -10 with "from"`, () => {
                const buffer = hexToBuffer("000AFFF6");
                const cStruct = CStructBE.from({
                    model: `{propertyA: U16, propertyB: I16}`,
                    types: '{U16: uint16, I16: int16}',
                });

                const result = cStruct.read(buffer);
                expect(result.struct.propertyA).toBe(10);
                expect(result.struct.propertyB).toBe(-10);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read -19088744 with "fromModelTypes"`, () => {
                const buffer = hexToBuffer("98BADCFE");
                const model = {r: 'i32'};
                const cStruct = CStructLE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read -19088744 with "from"`, () => {
                const buffer = hexToBuffer("98BADCFE");
                const cStruct = CStructLE.from({
                    model: {r: 'i32'}
                });

                const result = cStruct.read(buffer);
                expect(result.struct.r).toBe(-19088744);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read 10, -10 with "from"`, () => {
                const buffer = hexToBuffer("0A00F6FF");
                const cStruct = CStructLE.from({
                    model: `{propertyA: U16, propertyB: I16}`,
                    types: '{U16: uint16, I16: int16}',
                });

                const result = cStruct.read(buffer);
                expect(result.struct.propertyA).toBe(10);
                expect(result.struct.propertyB).toBe(-10);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });
    });
});
