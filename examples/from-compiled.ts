import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CStructBE, CStructLE } from "../src";

{
    const model = { a: 'u16', b: 'i16' };
    const data = { a: 10, b: -10 };

    // Build time: compile model once and persist jsonModel
    const compiled = CStructBE.fromModelTypes(model);
    const jsonModel = compiled.jsonModel;
    console.log('Compiled jsonModel:', jsonModel);
    // {"a":"u16","b":"i16"}

    const tmpFile = path.join(os.tmpdir(), 'cstruct-from-compiled-model.json');
    fs.writeFileSync(tmpFile, jsonModel, 'utf8');

    // Runtime: load precompiled model without ModelParser.parseModel
    const loadedJsonModel = fs.readFileSync(tmpFile, 'utf8');
    const cStructBe = CStructBE.fromCompiled(loadedJsonModel);
    const cStructLe = CStructLE.fromCompiled(JSON.parse(loadedJsonModel));

    const beBuffer = cStructBe.make(data).buffer;
    const leBuffer = cStructLe.make(data).buffer;

    console.log('BE make:', beBuffer.toString('hex'));
    // 000afff6
    console.log('LE make:', leBuffer.toString('hex'));
    // 0a00f6ff

    console.log('BE read:', cStructBe.read(beBuffer).struct);
    console.log('LE read:', cStructLe.read(leBuffer).struct);
    // both: { a: 10, b: -10 }

    fs.unlinkSync(tmpFile);
}
