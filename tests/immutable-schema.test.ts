import { CStructBE, CStructLE, hexToBuffer } from "../src";


describe('immutable schema POC', () => {
    const model = { a: 'u16', b: 'i16' };
    const data = { a: 10, b: -10 };
    const bufferBe = hexToBuffer('000AFFF6');
    const bufferLe = hexToBuffer('0A00F6FF');

    it('should keep parsedModel reference stable across reads (BE)', () => {
        const cStruct = CStructBE.fromModelTypes(model);
        const schemaBefore = cStruct.parsedModel;

        const first = cStruct.read(bufferBe);
        const schemaAfterFirst = cStruct.parsedModel;
        const second = cStruct.read(bufferBe);

        expect(schemaBefore).toBe(schemaAfterFirst);
        expect(first.struct).toEqual(data);
        expect(second.struct).toEqual(data);
    });

    it('should keep parsedModel reference stable across reads (LE)', () => {
        const cStruct = CStructLE.fromModelTypes(model);
        const schemaBefore = cStruct.parsedModel;

        cStruct.read(bufferLe);
        const schemaAfter = cStruct.parsedModel;

        expect(schemaBefore).toBe(schemaAfter);
    });

    it('should keep parsedModel stable across make operations (BE)', () => {
        const cStruct = CStructBE.fromModelTypes(model);
        const schemaBefore = cStruct.parsedModel;

        const first = cStruct.make(data);
        const schemaAfterFirst = cStruct.parsedModel;
        const second = cStruct.make(data);

        expect(schemaBefore).toBe(schemaAfterFirst);
        expect(first.buffer).toEqual(second.buffer);
    });

    it('modelClone should return the same cached schema object', () => {
        const cStruct = CStructBE.fromModelTypes(model);

        expect(cStruct.modelClone).toBe(cStruct.parsedModel);
    });
});
