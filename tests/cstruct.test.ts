import { CStruct, CStructBE, CStructLE } from "../src/tests";

describe('CStruct - default class with options', () => {

    it('should default to little endian', () => {
        const cStruct = new CStruct({ a: 'u16' });
        expect(cStruct.make({ a: 0x0a0b }).buffer).toEqual(Buffer.from([0x0b, 0x0a]));
    });

    it('should match CStructLE by default', () => {
        const model = { a: 'u16', b: 'i16' };
        const data = { a: 10, b: -10 };
        expect(new CStruct(model).make(data).buffer)
            .toEqual(CStructLE.fromModelTypes(model).make(data).buffer);
    });

    it('should use big endian with { endian: "be" } (constructor shorthand)', () => {
        const cStruct = new CStruct({ a: 'u16', b: 'i16' }, { endian: 'be' });
        expect(cStruct.make({ a: 10, b: -10 }).buffer.toString('hex')).toBe('000afff6');
    });

    it('should use big endian via fromModelTypes with types', () => {
        const model = { point: 'Point' };
        const types = { Point: { x: 'u8', y: 'u8' } };
        const cStruct = CStruct.fromModelTypes(model, types, { endian: 'be' });

        const { buffer } = cStruct.make({ point: { x: 1, y: 2 } });
        expect(buffer).toEqual(Buffer.from([1, 2]));

        const { struct } = cStruct.read(buffer);
        expect(struct).toEqual({ point: { x: 1, y: 2 } });
    });

    it('should throw for invalid endian', () => {
        expect(() => CStruct.fromModelTypes({ a: 'u16' }, undefined, { endian: 'middle' as any }))
            .toThrow('Invalid endian "middle"');
    });

    it('should read and write at an offset', () => {
        const cStruct = new CStruct({ a: 'u8', b: 'u16' }, { endian: 'be' });
        const frame = Buffer.from([0xaa, 0xbb, 0x00, 0x00, 0x00, 0x00]);

        const writeResult = cStruct.write(frame, { a: 1, b: 0x0203 }, 2);
        expect(writeResult.buffer).toEqual(Buffer.from([0xaa, 0xbb, 0x01, 0x02, 0x03, 0x00]));

        const readResult = cStruct.read(frame, 2);
        expect(readResult.struct).toEqual({ a: 1, b: 0x0203 });
        expect(readResult.offset).toBe(5);
    });

    it('should expose jsonModel and parsedModel', () => {
        const cStruct = new CStruct({ a: 'u16' }, { endian: 'be' });
        expect(cStruct.jsonModel).toBe('{"a":"u16"}');
        expect(cStruct.parsedModel).toEqual({ a: 'u16' });
        expect(cStruct.modelClone).toEqual({ a: 'u16' });
    });

    it('should support fromCompiled with options', () => {
        const compiled = CStructBE.fromModelTypes({ a: 'u16' }).jsonModel;
        const be = CStruct.fromCompiled(compiled, { endian: 'be' });
        const le = CStruct.fromCompiled(compiled);

        expect(be.make({ a: 0x0a0b }).buffer.toString('hex')).toBe('0a0b');
        expect(le.make({ a: 0x0a0b }).buffer.toString('hex')).toBe('0b0a');
    });

    it('should support fromCompiled with a parsed object', () => {
        const compiled = CStructBE.fromModelTypes({ a: 'u16' }).jsonModel;
        const cStruct = CStruct.fromCompiled(JSON.parse(compiled), { endian: 'be' });
        expect(cStruct.make({ a: 0x0a0b }).buffer.toString('hex')).toBe('0a0b');
    });

    it('should support compiled functions', () => {
        const cStruct = new CStruct({ a: 'u16' }, { endian: 'be' });
        const makeFn = cStruct.compileMake();
        expect(makeFn({ a: 0x0a0b }).buffer.toString('hex')).toBe('0a0b');

        const readFn = cStruct.compileRead();
        expect(readFn(Buffer.from([0x0a, 0x0b]), 0).struct).toEqual({ a: 0x0a0b });
    });
});
