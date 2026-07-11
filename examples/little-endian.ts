import { CStructBE, CStructLE } from "../src";

{
    const model = { a: 'u16', b: 'i16' };
    const data = { a: 10, b: -10 };

    const be = CStructBE.fromModelTypes(model).make(data).buffer;
    const le = CStructLE.fromModelTypes(model).make(data).buffer;

    console.log('BE:', be.toString('hex'));
    // 000afff6

    console.log('LE:', le.toString('hex'));
    // 0a00f6ff

    // Same struct, different byte order — pick the class that matches your protocol
    console.log(CStructBE.fromModelTypes(model).read(be).struct);
    console.log(CStructLE.fromModelTypes(model).read(le).struct);
    // both: { a: 10, b: -10 }
}
