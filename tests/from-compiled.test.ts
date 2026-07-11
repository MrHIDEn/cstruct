import { CStructBE, CStructLE, hexToBuffer } from "../src";


describe('fromCompiled', () => {
    const simpleModel = { a: 'u16', b: 'i16' };
    const simpleData = { a: 10, b: -10 };

    describe('BE', () => {
        it('should read the same as fromModelTypes', () => {
            const compiled = CStructBE.fromModelTypes(simpleModel);
            const fromTypes = CStructBE.fromModelTypes(simpleModel);
            const fromCompiled = CStructBE.fromCompiled(compiled.jsonModel);
            const buffer = hexToBuffer('000AFFF6');

            expect(fromCompiled.read(buffer)).toEqual(fromTypes.read(buffer));
        });

        it('should make the same as fromModelTypes', () => {
            const compiled = CStructBE.fromModelTypes(simpleModel);
            const fromTypes = CStructBE.fromModelTypes(simpleModel);
            const fromCompiled = CStructBE.fromCompiled(compiled.jsonModel);

            expect(fromCompiled.make(simpleData)).toEqual(fromTypes.make(simpleData));
        });

        it('should write the same as fromModelTypes', () => {
            const compiled = CStructBE.fromModelTypes(simpleModel);
            const fromTypes = CStructBE.fromModelTypes(simpleModel);
            const fromCompiled = CStructBE.fromCompiled(compiled.jsonModel);
            const buffer = hexToBuffer('00000000');

            expect(fromCompiled.write(buffer, simpleData)).toEqual(fromTypes.write(buffer, simpleData));
        });

        it('should accept compiled model as object', () => {
            const compiled = CStructBE.fromModelTypes(simpleModel);
            const parsed = JSON.parse(compiled.jsonModel);
            const fromCompiled = CStructBE.fromCompiled(parsed);
            const buffer = hexToBuffer('000AFFF6');

            expect(fromCompiled.read(buffer).struct).toEqual(simpleData);
        });

        it('should round-trip complex model with named types and dynamic array', () => {
            const model = { ab: 'Ab[i16]' };
            const types = { Ab: { a: 'i8', b: 'i8' } };
            const compiled = CStructBE.fromModelTypes(model, types);
            const jsonModel = compiled.jsonModel;
            const cStruct = CStructBE.fromCompiled(jsonModel);
            const struct = {
                ab: [
                    { a: -1, b: +1 },
                    { a: -2, b: +2 },
                ],
            };
            const expected = hexToBuffer('0002_FF_01_FE_02');

            const makeResult = cStruct.make(struct);
            expect(makeResult.buffer).toEqual(expected);

            const readResult = cStruct.read(makeResult.buffer);
            expect(readResult.struct).toEqual(struct);
        });
    });

    describe('LE', () => {
        it('should read the same as fromModelTypes', () => {
            const compiled = CStructLE.fromModelTypes(simpleModel);
            const fromTypes = CStructLE.fromModelTypes(simpleModel);
            const fromCompiled = CStructLE.fromCompiled(compiled.jsonModel);
            const buffer = hexToBuffer('0A00F6FF');

            expect(fromCompiled.read(buffer)).toEqual(fromTypes.read(buffer));
        });

        it('should make the same as fromModelTypes', () => {
            const compiled = CStructLE.fromModelTypes(simpleModel);
            const fromTypes = CStructLE.fromModelTypes(simpleModel);
            const fromCompiled = CStructLE.fromCompiled(compiled.jsonModel);

            expect(fromCompiled.make(simpleData)).toEqual(fromTypes.make(simpleData));
        });

        it('should write the same as fromModelTypes', () => {
            const compiled = CStructLE.fromModelTypes(simpleModel);
            const fromTypes = CStructLE.fromModelTypes(simpleModel);
            const fromCompiled = CStructLE.fromCompiled(compiled.jsonModel);
            const buffer = hexToBuffer('00000000');

            expect(fromCompiled.write(buffer, simpleData)).toEqual(fromTypes.write(buffer, simpleData));
        });
    });

    describe('validation', () => {
        it('should throw on invalid JSON string', () => {
            expect(() => CStructBE.fromCompiled('{not json}')).toThrow('Compiled model must be valid JSON.');
        });

        it('should throw on null', () => {
            expect(() => CStructBE.fromCompiled('null')).toThrow('Compiled model must be a JSON object or array.');
        });

        it('should throw on number', () => {
            expect(() => CStructBE.fromCompiled('42')).toThrow('Compiled model must be a JSON object or array.');
        });

        it('should throw on string primitive', () => {
            expect(() => CStructBE.fromCompiled('"hello"')).toThrow('Compiled model must be a JSON object or array.');
        });
    });
});
