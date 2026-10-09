import { CStructBE, CStructLE } from "../src/tests";

describe('enum - mapped values', () => {
    const enumModel = { type: 'u8', enum: { 1: 'FOO', 2: 'BAR', 3: 'BAZ' } };

    describe('BE', () => {
        describe('read', () => {
            it('should map raw value to name', () => {
                const buffer = Buffer.from([0x01, 0x02]);
                const model = { a: 'u8', b: enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct).toEqual({ a: 1, b: 'BAR' });
                expect(result.offset).toBe(2);
                expect(result.size).toBe(2);
            });

            it('should pass through raw value not present in the map', () => {
                const buffer = Buffer.from([0x2a]);
                const model = { b: enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.b).toBe(42);
            });

            it('should read enum inside a nested struct', () => {
                const buffer = Buffer.from([0x01, 0x00, 0x03, 0x01]);
                const model = { a: 'u8', d: { b: 'u16', c: enumModel } };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct).toEqual({ a: 1, d: { b: 3, c: 'FOO' } });
            });

            it('should read array of enums', () => {
                const buffer = Buffer.from([0x02, 0x01, 0x03]);
                const model = { list: [enumModel, enumModel, enumModel] };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.list).toEqual(['BAR', 'FOO', 'BAZ']);
            });

            it('should read dynamic array of enums', () => {
                const buffer = Buffer.from([0x02, 0x01, 0x03]);
                const model = { 'list.u8': enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.read(buffer);
                expect(result.struct.list).toEqual(['FOO', 'BAZ']);
            });
        });

        describe('make', () => {
            it('should make from a name', () => {
                const model = { a: 'u8', b: enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({ a: 1, b: 'BAR' });
                expect(result.buffer).toEqual(Buffer.from([0x01, 0x02]));
                expect(result.size).toBe(2);
            });

            it('should make from a raw value', () => {
                const model = { b: enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({ b: 2 });
                expect(result.buffer).toEqual(Buffer.from([0x02]));
            });

            it('should throw for unknown name', () => {
                const model = { b: enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                expect(() => cStruct.make({ b: 'UNKNOWN' })).toThrow('Unknown enum value "UNKNOWN"');
            });

            it('should make dynamic array of enums', () => {
                const model = { 'list.u8': enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.make({ list: ['BAR', 'FOO'] });
                expect(result.buffer).toEqual(Buffer.from([0x02, 0x02, 0x01]));
                expect(result.size).toBe(3);
            });
        });

        describe('write', () => {
            it('should write into an existing buffer', () => {
                const frame = Buffer.from([0x11, 0x00, 0x22]);
                const model = { a: 'u8', b: enumModel };
                const cStruct = CStructBE.fromModelTypes(model);

                const result = cStruct.write(frame, { a: 1, b: 'BAZ' });
                expect(result.buffer).toEqual(Buffer.from([0x01, 0x03, 0x22]));
                expect(result.size).toBe(2);
            });
        });
    });

    describe('LE', () => {
        it('should read little endian enum', () => {
            const buffer = Buffer.from([0x01, 0x00]);
            const model = { b: { type: 'u16', enum: { 1: 'FOO', 2: 'BAR' } } };
            const cStruct = CStructLE.fromModelTypes(model);

            const result = cStruct.read(buffer);
            expect(result.struct.b).toBe('FOO');
        });

        it('should make little endian enum', () => {
            const model = { b: { type: 'u16', enum: { 1: 'FOO', 2: 'BAR' } } };
            const cStruct = CStructLE.fromModelTypes(model);

            const result = cStruct.make({ b: 'BAR' });
            expect(result.buffer).toEqual(Buffer.from([0x02, 0x00]));
        });
    });

    describe('compiled functions', () => {
        it('read should map raw value to name', () => {
            const model = { b: enumModel };
            const cStruct = CStructBE.fromModelTypes(model);
            const readFn = cStruct.compileRead();

            const result = readFn(Buffer.from([0x02]));
            expect(result.struct.b).toBe('BAR');
        });

        it('make should map name to raw value', () => {
            const model = { b: enumModel };
            const cStruct = CStructBE.fromModelTypes(model);
            const makeFn = cStruct.compileMake();

            const result = makeFn({ b: 'BAZ' });
            expect(result.buffer).toEqual(Buffer.from([0x03]));
        });

        it('write should map name to raw value', () => {
            const model = { b: enumModel };
            const cStruct = CStructBE.fromModelTypes(model);
            const writeFn = cStruct.compileWrite();
            const target = Buffer.alloc(2);

            writeFn({ b: 'FOO' }, target, 0);
            expect(target[0]).toBe(0x01);
        });
    });
});
