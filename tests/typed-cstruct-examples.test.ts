import { CStruct, CStructBE, CStructLE, hexToBuffer } from "../src/tests";

/**
 * Conformance tests based on the examples from the README of `typed-cstruct`
 * (https://www.npmjs.com/package/typed-cstruct). The wire formats and expected
 * outputs are byte-identical — same struct, same bytes, same results.
 */
describe('typed-cstruct README examples (conformance)', () => {

    it('basic: { uint8_t a; int16_t b; float c; } (little endian)', () => {
        // buf = { 1, 0x0302, 1.0f }
        const cStruct = new CStruct({ a: 'u8', b: 'i16', c: 'f' });

        const buf = hexToBuffer('01 02 03 00 00 80 3f');
        expect(cStruct.read(buf).struct).toEqual({ a: 1, b: 0x0302, c: 1 });

        const { buffer } = cStruct.make({ a: 1, b: 0x0302, c: 1.0 });
        expect(buffer).toEqual(hexToBuffer('01 02 03 00 00 80 3f'));
    });

    it('offset: reading from byte 1', () => {
        const cStruct = new CStruct({ a: 'u8', b: 'i16', c: 'f' });
        const buf = hexToBuffer('ff 01 02 03 00 00 80 3f');
        const { struct, offset } = cStruct.read(buf, 1);
        expect(struct).toEqual({ a: 1, b: 0x0302, c: 1 });
        expect(offset).toBe(8);
    });

    it('endian: big endian', () => {
        const cStruct = new CStruct({ a: 'u8', b: 'i16' }, { endian: 'be' });
        const { buffer } = cStruct.make({ a: 1, b: 0x0302 });
        expect(buffer).toEqual(hexToBuffer('01 03 02'));
    });

    it('array: { uint8_t a; int16_t b[3]; } (big endian)', () => {
        // buf = { 1, { 0x0102, 0x0304, 0x0506 } }
        const cStruct = CStructBE.fromModelTypes({ a: 'u8', b: 'i16[3]' });

        const { buffer } = cStruct.make({ a: 1, b: [0x0102, 0x0304, 0x0506] });
        expect(buffer).toEqual(hexToBuffer('01 0102 0304 0506'));

        const { struct } = cStruct.read(buffer);
        expect(struct).toEqual({ a: 1, b: [0x0102, 0x0304, 0x0506] });
    });

    it('nested: { uint8_t a; struct { int16_t b; float c; } d; } (big endian)', () => {
        // buf = { 1, { 0x0203, 1.0f } }
        const cStruct = CStructBE.fromModelTypes({
            a: 'u8',
            d: { b: 'i16', c: 'f' },
        });

        const { buffer } = cStruct.make({ a: 1, d: { b: 0x0203, c: 1.0 } });
        expect(buffer).toEqual(hexToBuffer('01 0203 3f800000'));

        const { struct } = cStruct.read(buffer);
        expect(struct).toEqual({ a: 1, d: { b: 0x0203, c: 1 } });
    });

    it('string: { uint8_t a; char b[4]; }', () => {
        // buf = { 1, "foo" } — default encoding utf8
        const cStruct = CStructBE.fromModelTypes({ a: 'u8', b: 's4' });

        const { buffer } = cStruct.make({ a: 1, b: 'foo' });
        expect(buffer).toEqual(hexToBuffer('01 66 6f 6f 00'));

        const { struct } = cStruct.read(buffer);
        expect(struct).toEqual({ a: 1, b: 'foo' });
    });

    it('custom encodings: little endian LE path equals his LE bytes', () => {
        // same struct through explicit LE class
        const cStruct = CStructLE.fromModelTypes({ a: 'u8', b: 'i16', c: 'f' });
        const { buffer } = cStruct.make({ a: 1, b: 0x0302, c: 1.0 });
        expect(buffer).toEqual(hexToBuffer('01 02 03 00 00 80 3f'));
    });

    it('size: struct size matches his struct.size', () => {
        const cStruct = CStructBE.fromModelTypes({ a: 'u8', b: 'i16', c: 'f' });
        expect(cStruct.make({ a: 1, b: 0x0302, c: 1 }).size).toBe(7);
    });

    it('enum-like: { uint8_t a; enum b; }', () => {
        // his: enumLike(u8, {1:'FOO',2:'BAR',3:'BAZ'}), buf = { 1, 2 } -> b === 'BAR'
        const cStruct = CStructBE.fromModelTypes({
            a: 'u8',
            b: { type: 'u8', enum: { 1: 'FOO', 2: 'BAR', 3: 'BAZ' } },
        });
        expect(cStruct.read(hexToBuffer('01 02')).struct).toEqual({ a: 1, b: 'BAR' });
        expect(cStruct.make({ a: 1, b: 'BAR' }).buffer).toEqual(hexToBuffer('01 02'));
    });
});
