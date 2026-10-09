import { CStruct } from "../src";

{
    // `CStruct` defaults to little endian (`CStructLE`).
    // Pass `{ endian: 'be' }` for big endian — like `new Struct({ endian: "big" })` elsewhere.
    const model = { a: 'u16', b: 'i16' };
    const data = { a: 10, b: -10 };

    const le = new CStruct(model).make(data).buffer;
    console.log('default (LE):', le.toString('hex'));
    // 0a00f6ff

    const be = new CStruct(model, { endian: 'be' }).make(data).buffer;
    console.log('be:', be.toString('hex'));
    // 000afff6

    // Same API as CStructLE / CStructBE: read, write (with offset), compile*
    const cStruct = CStruct.fromModelTypes(model, undefined, { endian: 'be' });
    console.log(cStruct.read(be).struct);
    // { a: 10, b: -10 }
}
