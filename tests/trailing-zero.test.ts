import { hexToBuffer, CStructBE, CStructLE } from "../src";

describe('Trailing zero, string, json, not buffer', () => {
    describe('BE', () => {
        describe(`make dynamic`, () => {
            it(`should make buffer from {} j[0]`, () => {
                const model = {any1: 'j[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a: 1, b: [2, 3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.0': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(18);
                expect(result.size).toBe(18);
            });

            it(`should make buffer from [] j[0]`, () => {
                const model = ['j[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = [{a: 1, b: [2, 3]}];
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual(['j.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(18);
                expect(result.size).toBe(18);
            });

            it(`should make buffer from {} s[0]`, () => {
                const model = {any1: 's[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const expected = hexToBuffer('616263 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.0': 's'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer from [] s[0]`, () => {
                const model = ['s[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = ['abc'];
                const expected = hexToBuffer('616263 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual(['s.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer from {} ws[0]`, () => {
                const model = {any1: 'ws[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const expected = hexToBuffer('610062006300 0000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.0': 'ws'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make buffer from [] ws[0]`, () => {
                const model = ['ws[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = ['abc'];
                const expected = hexToBuffer('610062006300 0000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual(['ws.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should not make buffer from {} buf[0]`, () => {
                const model = {any1: 'buf[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: Buffer.from('abc')};

                const t = () => {
                    cStruct.make(struct);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

            it(`should not make buffer from [] buf[0]`, () => {
                const model = ['buf[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = [Buffer.from('abc')];

                const t = () => {
                    cStruct.make(struct);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });
        });

        describe(`write dynamic with offset 2`, () => {
            it(`should write to buffer from {} j[0]`, () => {
                const model = {any1: 'j[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: {a: 1, b: [2, 3]}};
                const buffer = hexToBuffer(  '1111 2222222222222222222222222222222222 33');
                const expected = hexToBuffer('1111 7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should write to buffer from [] j[0]`, () => {
                const model = ['j[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = [{a: 1, b: [2, 3]}];
                const buffer = hexToBuffer(  '1111 2222222222222222222222222222222222 33');
                const expected = hexToBuffer('1111 7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual(['j.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should write to buffer from {} s[0]`, () => {
                const model = {any1: 's[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const buffer = hexToBuffer(  '1111 222222 33');
                const expected = hexToBuffer('1111 616263 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 's'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write to buffer from [] s[0]`, () => {
                const model = ['s[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = ['abc'];
                const buffer = hexToBuffer(  '1111 222222 33');
                const expected = hexToBuffer('1111 616263 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual(['s.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write to buffer from {} ws[0]`, () => {
                const model = {any1: 'ws[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const buffer = hexToBuffer(  '1111 222222222222 3333');
                const expected = hexToBuffer('1111 610062006300 0000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'ws'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should write to buffer from [] ws[0]`, () => {
                const model = ['ws[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = ['abc'];
                const buffer = hexToBuffer(  '1111 222222222222 3333');
                const expected = hexToBuffer('1111 610062006300 0000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual(['ws.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should not write to buffer from {} buf[0]`, () => {
                const model = {any1: 'buf[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = {any1: Buffer.from('abc')};
                const buffer = hexToBuffer(  '1111 222222 33');

                const t = () => {
                    cStruct.write(buffer, struct, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

            it(`should not write to buffer from [] buf[0]`, () => {
                const model = ['buf[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const struct = [Buffer.from('abc')];
                const buffer = hexToBuffer(  '1111 222222 33');

                const t = () => {
                    cStruct.write(buffer, struct, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

        });

        describe(`read dynamic with offset 2`, () => {
            it(`should read from buffer from {} j[0]`, () => {
                const model = {any1: 'j[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 7b2261223a312c2262223a5b322c335d7d 00');
                const expected = {any1: {a: 1, b: [2, 3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should read from buffer from [] j[0]`, () => {
                const model = ['j[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 7b2261223a312c2262223a5b322c335d7d 00');
                const expected = [{a: 1, b: [2, 3]}];

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual(['j.0']);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should read from buffer from {} s[0]`, () => {
                const model = {any1: 's[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');
                const expected = {any1: 'abc'};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 's'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read from buffer from [] s[0]`, () => {
                const model = ['s[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');
                const expected = ['abc'];

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual(['s.0']);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read from buffer from {} ws[0]`, () => {
                const model = {any1: 'ws[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 610062006300 0000');
                const expected = {any1: 'abc'};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'ws'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should read from buffer from [] ws[0]`, () => {
                const model = ['ws[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 610062006300 0000');
                const expected = ['abc'];

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual(['ws.0']);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should not read from buffer from {} buf[0]`, () => {
                const model = {any1: 'buf[0]'};
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');

                const t = () => {
                    cStruct.read(buffer, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

            it(`should not read from buffer from [] buf[0]`, () => {
                const model = ['buf[0]'];
                const cStruct = CStructBE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');

                const t = () => {
                    cStruct.read(buffer, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

        });
    });

    describe('LE', () => {
        describe(`make dynamic`, () => {
            it(`should make buffer from {} j[0]`, () => {
                const model = {any1: 'j[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a: 1, b: [2, 3]}};
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.0': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(18);
                expect(result.size).toBe(18);
            });

            it(`should make buffer from [] j[0]`, () => {
                const model = ['j[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = [{a: 1, b: [2, 3]}];
                const expected = hexToBuffer('7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual(['j.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(18);
                expect(result.size).toBe(18);
            });

            it(`should make buffer from {} s[0]`, () => {
                const model = {any1: 's[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const expected = hexToBuffer('616263 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.0': 's'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer from [] s[0]`, () => {
                const model = ['s[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = ['abc'];
                const expected = hexToBuffer('616263 00');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual(['s.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer from {} ws[0]`, () => {
                const model = {any1: 'ws[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const expected = hexToBuffer('610062006300 0000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual({'any1.0': 'ws'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should make buffer from [] ws[0]`, () => {
                const model = ['ws[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = ['abc'];
                const expected = hexToBuffer('610062006300 0000');

                const result = cStruct.make(struct);
                expect(cStruct.modelClone).toEqual(['ws.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(8);
                expect(result.size).toBe(8);
            });

            it(`should not make buffer from {} buf[0]`, () => {
                const model = {any1: 'buf[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: Buffer.from('abc')};

                const t = () => {
                    cStruct.make(struct);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

            it(`should not make buffer from [] buf[0]`, () => {
                const model = ['buf[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = [Buffer.from('abc')];

                const t = () => {
                    cStruct.make(struct);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });
        });

        describe(`write dynamic with offset 2`, () => {
            it(`should write to buffer from {} j[0]`, () => {
                const model = {any1: 'j[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: {a: 1, b: [2, 3]}};
                const buffer = hexToBuffer(  '1111 2222222222222222222222222222222222 33');
                const expected = hexToBuffer('1111 7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'j'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should write to buffer from [] j[0]`, () => {
                const model = ['j[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = [{a: 1, b: [2, 3]}];
                const buffer = hexToBuffer(  '1111 2222222222222222222222222222222222 33');
                const expected = hexToBuffer('1111 7b2261223a312c2262223a5b322c335d7d 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual(['j.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should write to buffer from {} s[0]`, () => {
                const model = {any1: 's[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const buffer = hexToBuffer(  '1111 222222 33');
                const expected = hexToBuffer('1111 616263 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 's'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write to buffer from [] s[0]`, () => {
                const model = ['s[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = ['abc'];
                const buffer = hexToBuffer(  '1111 222222 33');
                const expected = hexToBuffer('1111 616263 00');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual(['s.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write to buffer from {} ws[0]`, () => {
                const model = {any1: 'ws[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: 'abc'};
                const buffer = hexToBuffer(  '1111 222222222222 3333');
                const expected = hexToBuffer('1111 610062006300 0000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'ws'});
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should write to buffer from [] ws[0]`, () => {
                const model = ['ws[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = ['abc'];
                const buffer = hexToBuffer(  '1111 222222222222 3333');
                const expected = hexToBuffer('1111 610062006300 0000');

                const result = cStruct.write(buffer, struct, 2);
                expect(cStruct.modelClone).toEqual(['ws.0']);
                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should not write to buffer from {} buf[0]`, () => {
                const model = {any1: 'buf[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = {any1: Buffer.from('abc')};
                const buffer = hexToBuffer(  '1111 222222 33');

                const t = () => {
                    cStruct.write(buffer, struct, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

            it(`should not write to buffer from [] buf[0]`, () => {
                const model = ['buf[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const struct = [Buffer.from('abc')];
                const buffer = hexToBuffer(  '1111 222222 33');

                const t = () => {
                    cStruct.write(buffer, struct, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

        });

        describe(`read dynamic with offset 2`, () => {
            it(`should read from buffer from {} j[0]`, () => {
                const model = {any1: 'j[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 7b2261223a312c2262223a5b322c335d7d 00');
                const expected = {any1: {a: 1, b: [2, 3]}};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'j'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should read from buffer from [] j[0]`, () => {
                const model = ['j[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 7b2261223a312c2262223a5b322c335d7d 00');
                const expected = [{a: 1, b: [2, 3]}];

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual(['j.0']);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(20);
                expect(result.size).toBe(18);
            });

            it(`should read from buffer from {} s[0]`, () => {
                const model = {any1: 's[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');
                const expected = {any1: 'abc'};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 's'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read from buffer from [] s[0]`, () => {
                const model = ['s[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');
                const expected = ['abc'];

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual(['s.0']);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read from buffer from {} ws[0]`, () => {
                const model = {any1: 'ws[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 610062006300 0000');
                const expected = {any1: 'abc'};

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual({'any1.0': 'ws'});
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should read from buffer from [] ws[0]`, () => {
                const model = ['ws[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 610062006300 0000');
                const expected = ['abc'];

                const result = cStruct.read(buffer, 2);
                expect(cStruct.modelClone).toEqual(['ws.0']);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(10);
                expect(result.size).toBe(8);
            });

            it(`should not read from buffer from {} buf[0]`, () => {
                const model = {any1: 'buf[0]'};
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');

                const t = () => {
                    cStruct.read(buffer, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

            it(`should not read from buffer from [] buf[0]`, () => {
                const model = ['buf[0]'];
                const cStruct = CStructLE.fromModelTypes(model);
                const buffer = hexToBuffer(  '1111 616263 00');

                const t = () => {
                    cStruct.read(buffer, 2);
                };
                expect(t).toThrow(new Error('Buffer size can not be 0.'));
            });

        });
    });
});