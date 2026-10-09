import { CStructBE, CStructLE, CStructUint8Array } from '../src';

function hex(bytes: Uint8Array): string {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('CStructUint8Array codegen (DataView) — parity with interpreter and Buffer variant', () => {
    it('compileMake: bytes identical to interpreter make and CStructLE.make', () => {
        const model = { a: 'u8', b: 'i16', c: 'f' };
        const data = { a: 1, b: -2, c: 1.5 };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.make(data).bytes)).toBe(ref);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
    });

    it('compileRead: struct identical to interpreter read', () => {
        const model = { a: 'u8', b: 'i16', c: 'f' };
        const data = { a: 1, b: -2, c: 1.5 };
        const uv = CStructUint8Array.fromModelTypes(model);
        const bytes = uv.make(data).bytes;
        expect(uv.compileRead()(bytes).struct).toEqual(uv.read(bytes).struct);
        expect(uv.compileRead()(bytes).offset).toBe(7);
    });

    it('BE: compileMake/compileRead parity with CStructBE', () => {
        const model = { a: 'u8', d: { b: 'i16', c: 'f' } };
        const data = { a: 1, d: { b: 0x0203, c: 1.0 } };
        const ref = CStructBE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model, undefined, { endian: 'be' });
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('full-width scalars: u32/i32/u64/i64/d/bools', () => {
        const model = { u: 'u32', i: 'i32', q: 'u64', l: 'i64', db: 'd', flag: 'b8', flag64: 'b64' };
        const data = { u: 0xffffffff, i: -5, q: BigInt('18446744073709551615'), l: BigInt(-1), db: 123.456, flag: true, flag64: false };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('static strings s4/ws4', () => {
        const model = { name: 's4', wname: 'ws4' };
        const data = { name: 'ab', wname: 'cd' };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('null-terminated s0 compiled read', () => {
        const uv = CStructUint8Array.fromModelTypes({ name: 's0' });
        const result = uv.compileRead()(new Uint8Array([0x61, 0x62, 0x63, 0x00, 0xff]));
        expect(result.struct).toEqual({ name: 'abc' });
        expect(result.offset).toBe(4);
    });

    it('dynamic string s[i16]', () => {
        const model = { name: 's[i16]' };
        const data = { name: 'sensor-01' };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('dynamic scalar array u8[i16]', () => {
        const model = { arr: 'u8[i16]' };
        const data = { arr: [1, 2, 3, 4, 5] };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('static array u8[3]', () => {
        const model = { arr: 'u8[3]' };
        const data = { arr: [1, 2, 3] };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('json field j[i16]', () => {
        const model = { meta: 'j[i16]' };
        const data = { meta: { x: 1, tags: ['a', 'b'] } };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromModelTypes(model);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
        expect(uv.compileRead()(uv.compileMake()(data).bytes).struct).toEqual(data);
    });

    it('compileWrite: into pre-allocated Uint8Array at offset, parity with interpreter write', () => {
        const model = { a: 'u8', b: 'i16' };
        const data = { a: 1, b: -2 };
        const uv = CStructUint8Array.fromModelTypes(model);
        const expected = new Uint8Array(10).fill(0xee);
        uv.write(expected, data, 2);

        const target = new Uint8Array(10).fill(0xee);
        const result = uv.compileWrite()(data, target, 2);
        expect(result.offset).toBe(5);
        expect(result.bytes).toBe(target);
        expect(hex(target)).toBe(hex(expected));
    });

    it('compileWrite: too-short buffer throws', () => {
        const uv = CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i32' });
        expect(() => uv.compileWrite()({ a: 1, b: 2 }, new Uint8Array(3))).toThrow(/too short/);
    });

    it('fromCompiled + compileMake parity', () => {
        const model = { a: 'u8', d: { b: 'i16', c: 'f' } };
        const data = { a: 1, d: { b: -2, c: 1.5 } };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        const uv = CStructUint8Array.fromCompiled(CStructLE.fromModelTypes(model).jsonModel);
        expect(hex(uv.compileMake()(data).bytes)).toBe(ref);
    });

    it('static compileMake(model) parity', () => {
        const model = { a: 'u8', b: 'i16' };
        const data = { a: 1, b: -2 };
        const ref = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');
        expect(hex(CStructUint8Array.compileMake(model)(data).bytes)).toBe(ref);
        expect(CStructUint8Array.compileRead<any>(model)(ref.length ? CStructUint8Array.compileMake(model)(data).bytes : new Uint8Array()).struct).toEqual(data);
    });

    it('enum model in compiled functions throws (documented limitation)', () => {
        const uv = CStructUint8Array.fromModelTypes({
            state: { type: 'u8', enum: { 1: 'IDLE' } },
        });
        expect(() => uv.compileMake()({ state: 'IDLE' })).toThrow(/Enum model type is not supported/);
        expect(() => uv.compileRead()(new Uint8Array([1]))).toThrow(/Enum model type is not supported/);
    });
});
