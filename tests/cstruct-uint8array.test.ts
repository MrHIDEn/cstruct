import { CStructBE, CStructLE, CStructUint8Array } from '../src';

function hex(bytes: Uint8Array): string {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('CStructUint8Array (variant B, DataView) — parity with Buffer variant', () => {
    it('basic LE: make bytes are byte-for-byte identical to CStructLE', () => {
        const model = { a: 'u8', b: 'i16', c: 'f' };
        const data = { a: 1, b: -2, c: 1.5 };
        const bufferBytes = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        const result = uv.make(data);
        expect(hex(result.bytes)).toBe(bufferBytes.toString('hex'));
        expect(result.offset).toBe(7);
        expect(result.size).toBe(7);
    });

    it('basic LE: read parity (same struct, same offset)', () => {
        const model = { a: 'u8', b: 'i16', c: 'f' };
        const data = { a: 1, b: -2, c: 1.5 };
        const bytes = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        const result = uv.read(bytes);
        expect(result.struct).toEqual(data);
        expect(result.offset).toBe(7);
        expect(result.size).toBe(7);
    });

    it('BE: make/read parity with CStructBE', () => {
        const model = { a: 'u8', b: 'i16[3]' };
        const data = { a: 1, b: [0x0102, 0x0304, 0x0506] };
        const bufferBytes = CStructBE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model, undefined, { endian: 'be' });
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        const result = uv.read(bufferBytes);
        expect(result.struct).toEqual(data);
    });

    it('new CStructUint8Array(model, { endian: "be" }) works', () => {
        const model = { a: 'u8', b: 'i16' };
        const data = { a: 1, b: 0x0203 };
        const uv = new CStructUint8Array(model, { endian: 'be' });
        expect(hex(uv.make(data).bytes)).toBe('010203');
        expect(uv.read(new Uint8Array([1, 2, 3])).struct).toEqual(data);
    });

    it('full-width scalars: u32/i32/u64/i64/d/bools', () => {
        const model = { u: 'u32', i: 'i32', q: 'u64', l: 'i64', db: 'd', flag: 'b8', flag16: 'b16' };
        const data = { u: 0xffffffff, i: -5, q: BigInt('18446744073709551615'), l: BigInt(-1), db: 123.456, flag: true, flag16: false };
        const bufferBytes = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        expect(uv.read(bufferBytes).struct).toEqual(data);
    });

    it('static strings s4/ws4', () => {
        const model = { name: 's4', wname: 'ws4' };
        const data = { name: 'ab', wname: 'cd' };
        const bufferBytes = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        expect(uv.read(bufferBytes).struct).toEqual(data);
    });

    it('null-terminated s0 read', () => {
        const model = { name: 's0' };
        const uv = CStructUint8Array.fromModelTypes(model);
        // 'abc' + null terminator
        const result = uv.read(new Uint8Array([0x61, 0x62, 0x63, 0x00, 0xff, 0xff]));
        expect(result.struct).toEqual({ name: 'abc' });
        expect(result.offset).toBe(4);
    });

    it('dynamic string s[i16]', () => {
        const model = { name: 's[i16]' };
        const data = { name: 'sensor-01' };
        const bufferBytes = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        expect(uv.read(bufferBytes).struct).toEqual(data);
    });

    it('dynamic buffer buf[i16] — accepts plain Uint8Array value', () => {
        const model = { blob: 'buf[i16]' };
        const value = new Uint8Array([1, 2, 3, 4, 5]);
        const bufferBytes = CStructLE.fromModelTypes(model).make({ blob: Buffer.from(value) }).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        const result = uv.make({ blob: value });
        expect(hex(result.bytes)).toBe(bufferBytes.toString('hex'));
        const readBack = uv.read(result.bytes).struct as { blob: Uint8Array };
        expect(Array.from(readBack.blob)).toEqual([1, 2, 3, 4, 5]);
    });

    it('nested object + enum', () => {
        const model = {
            a: 'u8',
            state: { type: 'u8', enum: { 1: 'IDLE', 2: 'RUN', 3: 'FAULT' } },
            d: { b: 'i16', c: 'f' },
        };
        const data = { a: 1, state: 'RUN', d: { b: 0x0203, c: 1.0 } };
        const bufferBytes = CStructBE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model, undefined, { endian: 'be' });
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        expect(uv.read(bufferBytes).struct).toEqual(data);
    });

    it('json field j[i16]', () => {
        const model = { meta: 'j[i16]' };
        const data = { meta: { x: 1, tags: ['a', 'b'] } };
        const bufferBytes = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        expect(uv.read(bufferBytes).struct).toEqual(data);
    });

    it('make() returns a plain Uint8Array, not a Buffer', () => {
        const uv = CStructUint8Array.fromModelTypes({ a: 'u8' });
        const result = uv.make({ a: 7 });
        expect(result.bytes).toBeInstanceOf(Uint8Array);
        expect(result.bytes.constructor).toBe(Uint8Array);
        expect(Buffer.isBuffer(result.bytes)).toBe(false);
    });

    it('read() accepts a Uint8Array view with byteOffset (no Buffer needed)', () => {
        const uv = CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i16' });
        const big = new Uint8Array([0xff, 0xff, 1, 0xfe, 0xff]);
        const result = uv.read(big.subarray(2)); // view with byteOffset = 2
        expect(result.struct).toEqual({ a: 1, b: -2 });
        expect(result.offset).toBe(3);
    });

    it('write() into a pre-allocated Uint8Array at offset', () => {
        const model = { a: 'u8', b: 'i16' };
        const data = { a: 1, b: -2 };
        const uv = CStructUint8Array.fromModelTypes(model);
        const target = new Uint8Array(10).fill(0xee);
        const result = uv.write(target, data, 2);
        expect(result.offset).toBe(5);
        expect(result.bytes).toBe(target); // same reference, written in place
        expect(hex(target)).toBe('eeee01feffeeeeeeeeee');
    });

    it('write() into a too-short buffer throws', () => {
        const uv = CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i32' });
        expect(() => uv.write(new Uint8Array(3), { a: 1, b: 2 })).toThrow(/too short/);
    });

    it('fromCompiled parity', () => {
        const model = { a: 'u8', d: { b: 'i16', c: 'f' } };
        const data = { a: 1, d: { b: -2, c: 1.5 } };
        const jsonModel = CStructLE.fromModelTypes(model).jsonModel;
        const uv = CStructUint8Array.fromCompiled(jsonModel);
        const bufferBytes = CStructLE.fromModelTypes(model).make(data).buffer;
        expect(hex(uv.make(data).bytes)).toBe(bufferBytes.toString('hex'));
        expect(uv.read(bufferBytes).struct).toEqual(data);
    });

    it('unknown type throws', () => {
        const uv = CStructUint8Array.fromModelTypes({ x: 'nosuchtype' });
        expect(() => uv.make({ x: 1 })).toThrow(/Unknown type/);
    });

    it('invalid endian throws', () => {
        expect(() => CStructUint8Array.fromModelTypes({ a: 'u8' }, undefined, { endian: 'xx' as any }))
            .toThrow(/Invalid endian/);
    });

    it('aliases parity with Buffer variant (uint8, BOOL, INT, float, string4)', () => {
        const model = { a: 'uint8', flag: 'BOOL', b: 'INT', c: 'float', name: 'string4' } as any;
        const data = { a: 1, flag: true, b: -2, c: 1.5, name: 'ab' };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer;
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.make(data).bytes)).toBe(ref.toString('hex'));
        expect(uv.read(ref).struct).toEqual(uv.read(uv.make(data).bytes).struct);
    });
});
