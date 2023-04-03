import { hexToBuffer, CStructBE, CStructLE } from "../src";

describe('buf - buffer - Buffer', () => {
    describe('BE', () => {
        describe(`read`, () => {
            it(`should read {r: 'buf3'}`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should read {r: 'buf3'}`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should read {r.i8: buf}`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('03 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read {r: 'buf3'} with offset 2`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should read {r: 'buf3'} with offset 2`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should read {r.i8: buf} with offset 2`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 03 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make {r: buf3}`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r: buf3}`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r.i8: buf}`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('03 12_34_56');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make and truncate static buffer`, () => {
                const model = {staticBuffer: 'buf[2]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {
                    staticBuffer: Buffer.from("abcdef")
                };

                const t = () => {
                    cStruct.make(struct);
                };
                expect(t).toThrow(new Error('Size of value 6 is greater than 2.'));
            });

            it(`should make and truncate static string`, () => {
                const model = {staticString: 'string[2]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {
                    staticString: "abcdef"
                };
                const expected = hexToBuffer('6162');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'staticString.2': 'string'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write {r: buf3}`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.write(buffer, struct);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r: buf3}`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.write(buffer, struct);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r.i8: buf}`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('00 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('03 12_34_56');

                const result = cStruct.write(buffer, struct);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write {r: buf3} with offset 2`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('7777 12_34_56');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should make {r: buf3} with offset 2`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('7777 12_34_56');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should make {r.i8: buf} with offset 2`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 00 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('7777 03 12_34_56');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`read`, () => {
            it(`should read {r: 'buf3'}`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should read {r: 'buf3'}`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should read {r.i8: buf}`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('03 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read {r: 'buf3'} with offset 2`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should read {r: 'buf3'} with offset 2`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should read {r.i8: buf} with offset 2`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 03 12_34_56');
                const expected = {r: hexToBuffer('12_34_56')};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`make`, () => {
            it(`should make {r: buf3}`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r: buf3}`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r.i8: buf}`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('03 12_34_56');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make and truncate static buffer`, () => {
                const model = {staticBuffer: 'buf[2]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {
                    staticBuffer: Buffer.from("abcdef")
                };

                const t = () => {
                    cStruct.make(struct);
                };
                expect(t).toThrow(new Error('Size of value 6 is greater than 2.'));
            });

            it(`should make and truncate static string`, () => {
                const model = {staticString: 'string[2]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {
                    staticString: "abcdef"
                };
                const expected = hexToBuffer('6162');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'staticString.2': 'string'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });
        });

        describe(`write`, () => {
            it(`should write {r: buf3}`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.write(buffer, struct);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r: buf3}`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('12_34_56');

                const result = cStruct.write(buffer, struct);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(3);
                expect(result.size).toBe(3);
            });

            it(`should make {r.i8: buf}`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('00 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('03 12_34_56');

                const result = cStruct.write(buffer, struct);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write {r: buf3} with offset 2`, () => {
                const model = {r: 'buf3'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('7777 12_34_56');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({r: 'buf3'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should make {r: buf3} with offset 2`, () => {
                const model = {r: 'buf[3]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('7777 12_34_56');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'r.3': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(5);
                expect(result.size).toBe(3);
            });

            it(`should make {r.i8: buf} with offset 2`, () => {
                const model = {r: 'buf[i8]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer('7777 00 00_00_00');
                const struct = {r: hexToBuffer('12_34_56')};
                const expected = hexToBuffer('7777 03 12_34_56');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'r.i8': 'buf'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });
});