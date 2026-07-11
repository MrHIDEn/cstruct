import { CStructBE, CStructLE, hexToBuffer } from '../src';

type CStructApi = typeof CStructBE | typeof CStructLE;

function expectCodegenParity(
    CStruct: CStructApi,
    model: object | string | string[],
    types: object | undefined,
    struct: unknown,
    buffer?: Buffer,
    offset = 0,
) {
    const cStruct = CStruct.fromModelTypes(model as never, types as never);

    const readFn = CStruct.compileRead(model as never, types as never);
    const writeFn = CStruct.compileWrite(model as never, types as never);
    const makeFn = CStruct.compileMake(model as never, types as never);

    const instanceReadFn = cStruct.compileRead();
    const instanceWriteFn = cStruct.compileWrite();
    const instanceMakeFn = cStruct.compileMake();

    const made = cStruct.make(struct as never);
    const madeCodegen = makeFn(struct as never);
    const madeInstance = instanceMakeFn(struct as never);

    expect(madeCodegen).toEqual(made);
    expect(madeInstance).toEqual(made);

    const readBuf = buffer ?? made.buffer;
    const readExpected = cStruct.read(readBuf, offset);
    const readCodegen = readFn(readBuf, offset);
    const readInstance = instanceReadFn(readBuf, offset);

    expect(readCodegen).toEqual(readExpected);
    expect(readInstance).toEqual(readExpected);

    const writeTarget = Buffer.alloc(Math.max(readBuf.length, made.buffer.length + offset + 16));
    const writeExpected = cStruct.write(writeTarget, struct as never, offset);
    const writeCopy = Buffer.alloc(writeTarget.length);
    const writeCodegen = writeFn(struct as never, writeCopy, offset);
    const writeInstanceCopy = Buffer.alloc(writeTarget.length);
    const writeInstance = instanceWriteFn(struct as never, writeInstanceCopy, offset);

    expect(writeCopy).toEqual(writeExpected.buffer);
    expect(writeCodegen).toEqual(writeExpected);
    expect(writeInstance).toEqual(writeExpected);
}

describe('codegen parity', () => {
    describe.each([
        ['BE', CStructBE],
        ['LE', CStructLE],
    ] as const)('%s', (_label, CStruct) => {
        it('scalars u16 i32 b8', () => {
            const model = { x: 'u16', y: 'i32', flag: 'b8' };
            const struct = { x: 0x1234, y: -7, flag: true };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('fixed string s5', () => {
            const model = { r: 's5' };
            const struct = { r: 'abc' };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('static array tuple', () => {
            const model = { r: ['u16', 'u16'] };
            const struct = { r: [0x1234, 0x5678] };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('root tuple model', () => {
            const model = ['u16', 'u16'];
            const struct = [0x1234, 0x5678];
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('nested struct', () => {
            const model = { error: { code: 'u16', message: 's5' } };
            const struct = { error: { code: 10, message: 'abc' } };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('dynamic u16 array', () => {
            const model = { r: 'u16[i16]' };
            const struct = { r: [0x1234, 0x5678] };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('dynamic nested type array', () => {
            const model = { ab: 'Ab[i16]' };
            const types = { Ab: { a: 'i8', b: 'i8' } };
            const struct = {
                ab: [
                    { a: -1, b: 1 },
                    { a: -2, b: 2 },
                ],
            };
            expectCodegenParity(CStruct, model, types, struct);
        });

        it('dynamic string s[i16]', () => {
            const model = { txt: 's[i16]' };
            const struct = { txt: 'ABCDE' };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('dynamic string s[i16] non-ascii', () => {
            const model = { txt: 's[i16]' };
            const struct = { txt: 'ąę' };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('dynamic json j[i16]', () => {
            const model = { any1: 'j[i16]' };
            const struct = { any1: { a: 1, b: [2, 3] } };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('trailing zero s[0]', () => {
            const model = { any1: 's[0]' };
            const struct = { any1: 'abc' };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('trailing zero j[0]', () => {
            const model = { any1: 'j[0]' };
            const struct = { any1: { a: 1, b: [2, 3] } };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('tuple with static and dynamic arrays', () => {
            const model = ['i8', 'i8[2]', 'i8[i16]'];
            const struct = [0x01, [0x02, 0x03], [0x04, 0x05, 0x06, 0x07]];
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('buffer field buf4', () => {
            const model = { b: 'buf4' };
            const struct = { b: hexToBuffer('01020304') };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('json field j20', () => {
            const model = { j: 'j[20]' };
            const struct = { j: { a: 1 } };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('PLC aliases', () => {
            const model = { b: 'BYTE', w: 'WORD', f: 'BOOL' };
            const struct = { b: 0x12, w: 0x3456, f: true };
            expectCodegenParity(CStruct, model, undefined, struct);
        });

        it('read with offset', () => {
            const model = { r: 'u16' };
            const cStruct = CStruct.fromModelTypes(model);
            const readFn = CStruct.compileRead(model);
            const buffer = hexToBuffer('0000 1234');
            const expected = cStruct.read(buffer, 2);
            expect(readFn(buffer, 2)).toEqual(expected);
        });

        it('fromCompiled instance compileRead', () => {
            const model = { a: 'u16', b: 'i16' };
            const cStruct = CStruct.fromModelTypes(model);
            const fromCompiled = CStruct.fromCompiled(cStruct.jsonModel);
            const buffer = cStruct.make({ a: 10, b: -10 }).buffer;
            expect(fromCompiled.compileRead()(buffer)).toEqual(cStruct.read(buffer));
        });

        it('write buffer too short throws', () => {
            const model = { r: 'u16' };
            const writeFn = CStruct.compileWrite(model);
            const buf = Buffer.alloc(4);
            expect(() => writeFn({ r: 1 }, buf, 3)).toThrow();
        });

        it('write buffer too short does not mutate target buffer', () => {
            const model = { r: 'u16' };
            const writeFn = CStruct.compileWrite(model);
            const buf = Buffer.alloc(8);
            buf.fill(0xaa);
            const before = Buffer.from(buf);
            expect(() => writeFn({ r: 0x1234 }, buf, 7)).toThrow();
            expect(buf).toEqual(before);
        });

        it('bracket notation for unusual field keys', () => {
            const model = { '__proto__': 'u16' };
            const struct = { '__proto__': 42 };
            expectCodegenParity(CStruct, model, undefined, struct);
            expect(Object.prototype).not.toHaveProperty('42');
        });
    });
});
