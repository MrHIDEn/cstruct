import { Model, ModelValue, SpecialType, Type } from '../types';
import { getAtomSpec, getLengthPrefixSpec } from './atom-spec';
import {
    extractTypeAndSize,
    getDotGroups,
    getSpecialType,
    parseSizedAtom,
} from './type-utils';
import { CodegenContext, CodegenMode, Endian } from './types';

function tmpId(ctx: CodegenContext): string {
    return `_t${ctx.counter++}`;
}

function push(ctx: CodegenContext, line: string) {
    ctx.lines.push(line);
}

function readLength(ctx: CodegenContext, lengthType: string, offsetVar: string): string {
    const spec = getLengthPrefixSpec(lengthType, ctx.endian);
    const id = tmpId(ctx);
    push(ctx, `const ${id} = ${spec.readExpr(offsetVar)}; ${offsetVar} += ${spec.size};`);
    return id;
}

function writeLength(ctx: CodegenContext, lengthType: string, offsetVar: string, value: string) {
    const spec = getLengthPrefixSpec(lengthType, ctx.endian);
    if (ctx.accumulateSize) {
        push(ctx, `size += ${spec.size};`);
    } else if (isChunkMake(ctx)) {
        const b = tmpId(ctx);
        push(ctx, `{ const ${b} = Buffer.allocUnsafe(${spec.size}); ${spec.writeExpr(b, '0', value)}; chunks.push(${b}); }`);
    } else {
        push(ctx, `${spec.writeExpr('buf', offsetVar, value)}; ${offsetVar} += ${spec.size};`);
    }
}

function readStringUtf8(ctx: CodegenContext, offsetVar: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = buf.toString('utf8', ${offsetVar}, ${offsetVar} + ${sizeExpr}).split('\\0')[0]; ${offsetVar} += ${sizeExpr};`);
}

function readStringUtf8Trailing(ctx: CodegenContext, offsetVar: string, target: string) {
    const sz = tmpId(ctx);
    push(ctx, `{ const ${sz} = buf.indexOf(0, ${offsetVar}) - ${offsetVar} + 1; ${target} = buf.toString('utf8', ${offsetVar}, ${offsetVar} + ${sz}).split('\\0')[0]; ${offsetVar} += ${sz}; }`);
}

function readWString(ctx: CodegenContext, offsetVar: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = buf.toString('utf16le', ${offsetVar}, ${offsetVar} + ${sizeExpr}).split('\\u0000')[0]; ${offsetVar} += ${sizeExpr};`);
}

function readWStringTrailing(ctx: CodegenContext, offsetVar: string, target: string) {
    const sz = tmpId(ctx);
    push(ctx, `{ const ${sz} = buf.indexOf('\\u0000', ${offsetVar}, 'utf16le') - ${offsetVar} + 2; ${target} = buf.toString('utf16le', ${offsetVar}, ${offsetVar} + ${sz}).split('\\u0000')[0]; ${offsetVar} += ${sz}; }`);
}

function readBuffer(ctx: CodegenContext, offsetVar: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = buf.slice(${offsetVar}, ${offsetVar} + ${sizeExpr}); ${offsetVar} += ${sizeExpr};`);
}

function writeStringUtf8(ctx: CodegenContext, offsetVar: string, valueExpr: string, size: number | string, trailing = false, dynamic = false) {
    if (ctx.accumulateSize) {
        if (trailing) {
            push(ctx, `size += Buffer.byteLength(${valueExpr}, 'utf8') + 1;`);
        } else if (dynamic) {
            push(ctx, `size += Buffer.byteLength(${valueExpr}, 'utf8');`);
        } else {
            push(ctx, `size += ${size};`);
        }
    } else if (isChunkMake(ctx)) {
        if (trailing) {
            const b = tmpId(ctx);
            push(ctx, `{ const ${b} = Buffer.alloc(Buffer.byteLength(${valueExpr}, 'utf8') + 1); ${b}.write(${valueExpr}, 0, 'utf8'); chunks.push(${b}); }`);
        } else if (dynamic) {
            const b = tmpId(ctx);
            push(ctx, `{ const ${b} = Buffer.alloc(Buffer.byteLength(${valueExpr}, 'utf8')); ${b}.write(${valueExpr}, 0, 'utf8'); chunks.push(${b}); }`);
        } else {
            const b = tmpId(ctx);
            push(ctx, `{ const ${b} = Buffer.alloc(${size}); ${b}.write(${valueExpr}, 0, ${size}, 'utf8'); chunks.push(${b}); }`);
        }
    } else {
        if (trailing) {
            push(ctx, `{ const _b = Buffer.byteLength(${valueExpr}, 'utf8'); buf.write(${valueExpr}, ${offsetVar}); buf.writeUInt8(0, ${offsetVar} + _b); ${offsetVar} += _b + 1; }`);
        } else if (dynamic) {
            push(ctx, `{ const _b = Buffer.byteLength(${valueExpr}, 'utf8'); buf.write(${valueExpr}, ${offsetVar}, _b, 'utf8'); ${offsetVar} += _b; }`);
        } else {
            push(ctx, `buf.fill(0, ${offsetVar}, ${offsetVar} + ${size}); buf.write(${valueExpr}, ${offsetVar}, ${size}, 'utf8'); ${offsetVar} += ${size};`);
        }
    }
}

function writeWString(ctx: CodegenContext, offsetVar: string, valueExpr: string, size: number | string, trailing = false) {
    const byteSize = typeof size === 'number' ? size * 2 : `(${size}) * 2`;
    if (ctx.accumulateSize) {
        if (trailing) {
            push(ctx, `size += (${valueExpr}).length * 2 + 2;`);
        } else {
            push(ctx, `size += ${byteSize};`);
        }
    } else if (isChunkMake(ctx)) {
        if (trailing) {
            const b = tmpId(ctx);
            push(ctx, `{ const ${b} = Buffer.alloc((${valueExpr}).length * 2 + 2); ${b}.write(${valueExpr}, 0, 'utf16le'); chunks.push(${b}); }`);
        } else {
            const b = tmpId(ctx);
            push(ctx, `{ const ${b} = Buffer.alloc(${byteSize}); ${b}.write(${valueExpr}, 0, ${byteSize}, 'utf16le'); chunks.push(${b}); }`);
        }
    } else {
        if (trailing) {
            const b = tmpId(ctx);
            push(ctx, `{ const ${b} = (${valueExpr}).length * 2; buf.write(${valueExpr}, ${offsetVar}, ${b}, 'utf16le'); buf.writeUInt16LE(0, ${offsetVar} + ${b}); ${offsetVar} += ${b} + 2; }`);
        } else {
            push(ctx, `buf.fill(0, ${offsetVar}, ${offsetVar} + ${byteSize}); buf.write(${valueExpr}, ${offsetVar}, ${byteSize}, 'utf16le'); ${offsetVar} += ${byteSize};`);
        }
    }
}

function writeBufferField(ctx: CodegenContext, offsetVar: string, valueExpr: string, size: number) {
    if (ctx.accumulateSize) {
        push(ctx, `size += ${size};`);
    } else if (isChunkMake(ctx)) {
        const b = tmpId(ctx);
        push(ctx, `{ const ${b} = Buffer.alloc(${size}); ${valueExpr}.copy(${b}, 0, 0, ${size}); chunks.push(${b}); }`);
    } else {
        push(ctx, `${valueExpr}.copy(buf, ${offsetVar}, 0, ${size}); ${offsetVar} += ${size};`);
    }
}

function writeAtom(ctx: CodegenContext, type: string, offsetVar: string, valueExpr: string) {
    const spec = getAtomSpec(type, ctx.endian);
    if (!spec) throw new Error(`Unknown type ${type}`);
    if (ctx.accumulateSize) {
        push(ctx, `size += ${spec.size};`);
    } else if (isChunkMake(ctx)) {
        const b = tmpId(ctx);
        push(ctx, `{ const ${b} = Buffer.allocUnsafe(${spec.size}); ${spec.writeExpr(b, '0', valueExpr)}; chunks.push(${b}); }`);
    } else {
        push(ctx, `${spec.writeExpr('buf', offsetVar, valueExpr)}; ${offsetVar} += ${spec.size};`);
    }
}

function readAtom(ctx: CodegenContext, type: string, offsetVar: string, target: string) {
    const spec = getAtomSpec(type, ctx.endian);
    if (!spec) throw new Error(`Unknown type ${type}`);
    push(ctx, `${target} = ${spec.readExpr(offsetVar)}; ${offsetVar} += ${spec.size};`);
}

function readScalarType(ctx: CodegenContext, modelType: string, offsetVar: string, target: string) {
    if (modelType === 'buf0') {
        throw new Error('Buffer size can not be 0. (read)');
    }

    const atom = getAtomSpec(modelType, ctx.endian);
    if (atom) {
        readAtom(ctx, modelType, offsetVar, target);
        return;
    }

    const sized = parseSizedAtom(modelType);
    if (sized) {
        const special = getSpecialType(sized.base);
        if (special === SpecialType.String) {
            if (sized.size === 0) {
                readStringUtf8Trailing(ctx, offsetVar, target);
            } else {
                readStringUtf8(ctx, offsetVar, String(sized.size), target);
            }
            return;
        }
        if (special === SpecialType.WString) {
            const bytes = sized.size * 2;
            if (sized.size === 0) {
                readWStringTrailing(ctx, offsetVar, target);
            } else {
                readWString(ctx, offsetVar, String(bytes), target);
            }
            return;
        }
        if (special === SpecialType.Buffer) {
            readBuffer(ctx, offsetVar, String(sized.size), target);
            return;
        }
        if (special === SpecialType.Json) {
            if (sized.size === 0) {
                readStringUtf8Trailing(ctx, offsetVar, target);
                push(ctx, `${target} = JSON.parse(${target});`);
            } else {
                const raw = tmpId(ctx);
                readStringUtf8(ctx, offsetVar, String(sized.size), raw);
                push(ctx, `${target} = JSON.parse(${raw});`);
            }
            return;
        }
    }

    if (modelType === 'j0') {
        const raw = tmpId(ctx);
        readStringUtf8Trailing(ctx, offsetVar, raw);
        push(ctx, `${target} = JSON.parse(${raw});`);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

function writeScalarType(ctx: CodegenContext, modelType: string, offsetVar: string, valueExpr: string) {
    if (modelType === 'buf0') {
        throw new Error('Buffer size can not be 0. (make)');
    }

    const atom = getAtomSpec(modelType, ctx.endian);
    if (atom) {
        writeAtom(ctx, modelType, offsetVar, valueExpr);
        return;
    }

    const sized = parseSizedAtom(modelType);
    if (sized) {
        const special = getSpecialType(sized.base);
        if (special === SpecialType.String) {
            writeStringUtf8(ctx, offsetVar, valueExpr, sized.size, sized.size === 0);
            return;
        }
        if (special === SpecialType.WString) {
            writeWString(ctx, offsetVar, valueExpr, sized.size, sized.size === 0);
            return;
        }
        if (special === SpecialType.Buffer) {
            writeBufferField(ctx, offsetVar, valueExpr, sized.size);
            return;
        }
        if (special === SpecialType.Json) {
            const jsonExpr = sized.size === 0 ? `JSON.stringify(${valueExpr})` : `JSON.stringify(${valueExpr})`;
            writeStringUtf8(ctx, offsetVar, jsonExpr, sized.size, sized.size === 0);
            return;
        }
    }

    if (modelType === 'j0') {
        writeStringUtf8(ctx, offsetVar, `JSON.stringify(${valueExpr})`, 0, true);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

function readArrayItems(
    ctx: CodegenContext,
    itemsType: Type,
    sizeExpr: string,
    offsetVar: string,
    target: string,
) {
    push(ctx, `${target} = [];`);
    const i = tmpId(ctx);
    push(ctx, `for (let ${i} = 0; ${i} < ${sizeExpr}; ${i}++) {`);
    if (typeof itemsType === 'object' && !Array.isArray(itemsType)) {
        const elem = tmpId(ctx);
        push(ctx, `const ${elem} = {};`);
        generateReadObject(ctx, itemsType as Model, offsetVar, elem);
        push(ctx, `${target}[${i}] = ${elem};`);
    } else if (typeof itemsType === 'string') {
        const elem = tmpId(ctx);
        readField(ctx, itemsType, offsetVar, elem);
        push(ctx, `${target}[${i}] = ${elem};`);
    } else if (Array.isArray(itemsType)) {
        const elem = tmpId(ctx);
        push(ctx, `const ${elem} = [];`);
        generateReadTuple(ctx, itemsType, offsetVar, elem, `${i}`);
        push(ctx, `${target}[${i}] = ${elem};`);
    } else {
        throw new TypeError(`Unknown type "${itemsType}"`);
    }
    push(ctx, '}');
}

function writeArrayItems(
    ctx: CodegenContext,
    itemsType: Type,
    structArrayExpr: string,
    offsetVar: string,
) {
    if (ctx.accumulateSize && typeof itemsType === 'string') {
        const spec = getAtomSpec(itemsType, ctx.endian);
        if (spec) {
            push(ctx, `size += ${structArrayExpr}.length * ${spec.size};`);
            return;
        }
    }

    const i = tmpId(ctx);
    push(ctx, `for (let ${i} = 0; ${i} < ${structArrayExpr}.length; ${i}++) {`);
    if (typeof itemsType === 'object' && !Array.isArray(itemsType)) {
        generateWriteObject(ctx, itemsType as Model, offsetVar, `${structArrayExpr}[${i}]`);
    } else if (typeof itemsType === 'string') {
        writeField(ctx, itemsType, offsetVar, `${structArrayExpr}[${i}]`);
    } else {
        throw new TypeError(`Unknown type "${itemsType}"`);
    }
    push(ctx, '}');
}

function readDynamicOrStatic(
    ctx: CodegenContext,
    modelType: string,
    dynamicLength: string,
    readType: string,
    offsetVar: string,
    target: string,
) {
    const { specialType, isStatic, staticSize } = extractTypeAndSize(modelType, dynamicLength);
    let sizeExpr: string;

    if (isStatic) {
        sizeExpr = String(staticSize);
    } else {
        sizeExpr = readLength(ctx, dynamicLength, offsetVar);
    }

    if (+sizeExpr === 0 && specialType === SpecialType.Buffer) {
        throw new Error('Buffer size can not be 0.');
    }

    if (specialType) {
        if (specialType === SpecialType.Json) {
            const raw = tmpId(ctx);
            if (isStatic && staticSize === 0) {
                readStringUtf8Trailing(ctx, offsetVar, raw);
            } else if (!isStatic) {
                readStringUtf8(ctx, offsetVar, sizeExpr, raw);
            } else {
                readStringUtf8(ctx, offsetVar, sizeExpr, raw);
            }
            push(ctx, `${target} = JSON.parse(${raw});`);
            return;
        }
        if (specialType === SpecialType.String) {
            if (isStatic && staticSize === 0) {
                readStringUtf8Trailing(ctx, offsetVar, target);
            } else {
                readStringUtf8(ctx, offsetVar, sizeExpr, target);
            }
            return;
        }
        if (specialType === SpecialType.WString) {
            const byteSize = isStatic && staticSize > 0 ? `${staticSize * 2}` : `(${sizeExpr}) * 2`;
            if (isStatic && staticSize === 0) {
                readWStringTrailing(ctx, offsetVar, target);
            } else {
                readWString(ctx, offsetVar, byteSize, target);
            }
            return;
        }
        if (specialType === SpecialType.Buffer) {
            readBuffer(ctx, offsetVar, sizeExpr, target);
            return;
        }
    }

    readArrayItems(ctx, readType, sizeExpr, offsetVar, target);
}

function writeDynamicOrStatic(
    ctx: CodegenContext,
    modelType: string,
    dynamicLength: string,
    structKeyExpr: string,
    writeType: string,
    offsetVar: string,
) {
    const { specialType, isStatic, staticSize } = extractTypeAndSize(modelType, dynamicLength);

    let valueExpr = structKeyExpr;
    if (specialType === SpecialType.Json) {
        valueExpr = `JSON.stringify(${structKeyExpr})`;
    }

    if (isStatic && staticSize !== 0 && specialType !== SpecialType.String) {
        push(ctx, `if (${structKeyExpr}.length > ${staticSize}) throw new Error('Size of value ' + ${structKeyExpr}.length + ' is greater than ${staticSize}.');`);
    }

    const sizeExpr = isStatic ? String(staticSize) : `${structKeyExpr}.length`;

    if (+sizeExpr === 0 && specialType === SpecialType.Buffer) {
        throw new Error('Buffer size can not be 0.');
    }

    if (!isStatic) {
        writeLength(ctx, dynamicLength, offsetVar, sizeExpr);
    }

    if (specialType) {
        if (specialType === SpecialType.String) {
            if (isStatic && staticSize === 0) {
                writeStringUtf8(ctx, offsetVar, structKeyExpr, 0, true);
            } else if (!isStatic) {
                writeStringUtf8(ctx, offsetVar, structKeyExpr, 0, false, true);
            } else {
                writeStringUtf8(ctx, offsetVar, structKeyExpr, staticSize);
            }
            return;
        }
        if (specialType === SpecialType.WString) {
            if (isStatic && staticSize === 0) {
                writeWString(ctx, offsetVar, structKeyExpr, 0, true);
            } else if (!isStatic) {
                if (ctx.accumulateSize) {
                    push(ctx, `size += (${structKeyExpr}).length * 2;`);
                } else if (isChunkMake(ctx)) {
                    const b = tmpId(ctx);
                    push(ctx, `{ const ${b} = Buffer.alloc((${structKeyExpr}).length * 2); ${b}.write(${structKeyExpr}, 0, 'utf16le'); chunks.push(${b}); }`);
                } else {
                    const b = tmpId(ctx);
                    push(ctx, `{ const ${b} = (${structKeyExpr}).length * 2; buf.write(${structKeyExpr}, ${offsetVar}, ${b}, 'utf16le'); ${offsetVar} += ${b}; }`);
                }
            } else {
                writeWString(ctx, offsetVar, structKeyExpr, staticSize);
            }
            return;
        }
        if (specialType === SpecialType.Buffer) {
            if (isStatic) {
                writeBufferField(ctx, offsetVar, structKeyExpr, staticSize);
            } else {
                throw new Error('Dynamic buffer without static size is not supported in write path.');
            }
            return;
        }
        if (specialType === SpecialType.Json) {
            if (isStatic && staticSize === 0) {
                writeStringUtf8(ctx, offsetVar, valueExpr, 0, true);
            } else if (!isStatic) {
                writeStringUtf8(ctx, offsetVar, valueExpr, 0, false, true);
            } else {
                writeStringUtf8(ctx, offsetVar, valueExpr, staticSize);
            }
            return;
        }
    }

    writeArrayItems(ctx, writeType, structKeyExpr, offsetVar);
}

function readField(ctx: CodegenContext, modelType: Type, offsetVar: string, target: string) {
    if (Array.isArray(modelType)) {
        push(ctx, `${target} = [];`);
        generateReadTuple(ctx, modelType, offsetVar, target, '');
        return;
    }

    if (typeof modelType === 'string') {
        const typeGroups = getDotGroups(modelType);
        if (typeGroups) {
            readDynamicOrStatic(
                ctx,
                typeGroups.dynamicType,
                typeGroups.dynamicLength,
                typeGroups.dynamicType,
                offsetVar,
                target,
            );
            return;
        }
        readScalarType(ctx, modelType, offsetVar, target);
        return;
    }

    if (typeof modelType === 'object') {
        push(ctx, `${target} = {};`);
        generateReadObject(ctx, modelType as Model, offsetVar, target);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

function writeField(ctx: CodegenContext, modelType: Type, offsetVar: string, valueExpr: string) {
    if (Array.isArray(modelType)) {
        for (let i = 0; i < modelType.length; i++) {
            writeField(ctx, modelType[i], offsetVar, `${valueExpr}[${i}]`);
        }
        return;
    }

    if (typeof modelType === 'object' && !Array.isArray(modelType)) {
        generateWriteObject(ctx, modelType as Model, offsetVar, valueExpr);
        return;
    }

    if (typeof modelType === 'string') {
        const typeGroups = getDotGroups(modelType);
        if (typeGroups) {
            writeDynamicOrStatic(
                ctx,
                typeGroups.dynamicType,
                typeGroups.dynamicLength,
                valueExpr,
                typeGroups.dynamicType,
                offsetVar,
            );
            return;
        }
        writeScalarType(ctx, modelType, offsetVar, valueExpr);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

type TupleModel = ModelValue[];

function generateReadTuple(
    ctx: CodegenContext,
    model: TupleModel,
    offsetVar: string,
    target: string,
    indexPrefix: string,
) {
    for (let i = 0; i < model.length; i++) {
        const itemType = model[i];
        const idx = indexPrefix ? `${indexPrefix}[${i}]` : String(i);
        const elem = tmpId(ctx);
        readField(ctx, itemType as Type, offsetVar, elem);
        push(ctx, `${target}[${idx}] = ${elem};`);
    }
}

function generateReadObject(ctx: CodegenContext, model: Model, offsetVar: string, target: string) {
    if (Array.isArray(model)) {
        generateReadTuple(ctx, model as ModelValue[], offsetVar, target, '');
        return;
    }

    for (const [modelKey, modelType] of Object.entries(model)) {
        const keyGroups = getDotGroups(modelKey);
        if (keyGroups) {
            const { dynamicType, dynamicLength } = keyGroups;
            const val = tmpId(ctx);
            readDynamicOrStatic(
                ctx,
                modelType as string,
                dynamicLength,
                modelType as string,
                offsetVar,
                val,
            );
            push(ctx, `${target}.${dynamicType} = ${val};`);
            continue;
        }

        if (typeof modelType === 'string') {
            const typeGroups = getDotGroups(modelType);
            if (typeGroups) {
                const val = tmpId(ctx);
                readDynamicOrStatic(
                    ctx,
                    typeGroups.dynamicType,
                    typeGroups.dynamicLength,
                    typeGroups.dynamicType,
                    offsetVar,
                    val,
                );
                push(ctx, `${target}.${modelKey} = ${val};`);
                continue;
            }
        }

        const val = tmpId(ctx);
        readField(ctx, modelType, offsetVar, val);
        push(ctx, `${target}.${modelKey} = ${val};`);
    }
}

function generateWriteObject(ctx: CodegenContext, model: Model, offsetVar: string, structExpr: string) {
    if (Array.isArray(model)) {
        for (let i = 0; i < model.length; i++) {
            writeField(ctx, model[i], offsetVar, `${structExpr}[${i}]`);
        }
        return;
    }

    for (const [modelKey, modelType] of Object.entries(model)) {
        const keyGroups = getDotGroups(modelKey);
        if (keyGroups) {
            const { dynamicType, dynamicLength } = keyGroups;
            writeDynamicOrStatic(
                ctx,
                modelType as string,
                dynamicLength,
                `${structExpr}.${dynamicType}`,
                modelType as string,
                offsetVar,
            );
            continue;
        }

        if (typeof modelType === 'string') {
            const typeGroups = getDotGroups(modelType);
            if (typeGroups) {
                writeDynamicOrStatic(
                    ctx,
                    typeGroups.dynamicType,
                    typeGroups.dynamicLength,
                    `${structExpr}.${modelKey}`,
                    typeGroups.dynamicType,
                    offsetVar,
                );
                continue;
            }
        }

        writeField(ctx, modelType, offsetVar, `${structExpr}.${modelKey}`);
    }
}

function createContext(endian: Endian, mode: CodegenMode, useChunks: boolean, accumulateSize = false): CodegenContext {
    return { endian, mode, lines: [], counter: 0, useChunks, accumulateSize };
}

function isChunkMake(ctx: CodegenContext): boolean {
    return ctx.mode === 'make' && ctx.useChunks && !ctx.accumulateSize;
}

export function generateReadBody(model: Model, endian: Endian): string {
    const ctx = createContext(endian, 'read', false);
    push(ctx, 'off = off || 0;');
    push(ctx, 'let o = off;');
    const root = tmpId(ctx);
    if (Array.isArray(model)) {
        push(ctx, `const ${root} = [];`);
        generateReadTuple(ctx, model as ModelValue[], 'o', root, '');
        push(ctx, `return { struct: ${root}, offset: o, size: o - off };`);
    } else {
        push(ctx, `const ${root} = {};`);
        generateReadObject(ctx, model, 'o', root);
        push(ctx, `return { struct: ${root}, offset: o, size: o - off };`);
    }
    return ctx.lines.join('\n');
}

export function generateWriteBody(model: Model, endian: Endian): string {
    const ctx = createContext(endian, 'write', false);
    push(ctx, 'off = off || 0;');
    push(ctx, 'let o = off;');
    if (Array.isArray(model)) {
        generateWriteObject(ctx, model, 'o', 'struct');
    } else {
        generateWriteObject(ctx, model, 'o', 'struct');
    }
    push(ctx, 'const written = o - off;');
    push(ctx, 'if (written > buf.length - off) throw new Error("Write buffer is too short. Needs " + (written - (buf.length - off)) + " byte/s more.");');
    push(ctx, 'return { buffer: buf, offset: o, size: written };');
    return ctx.lines.join('\n');
}

export function generateMakeBody(model: Model, endian: Endian, useChunks: boolean, staticSize: number): string {
    if (useChunks) {
        const sizeCtx = createContext(endian, 'make', false, true);
        push(sizeCtx, 'let size = 0;');
        generateWriteObject(sizeCtx, model, 'o', 'struct');

        const writeCtx = createContext(endian, 'make', false, false);
        push(writeCtx, 'let o = 0;');
        generateWriteObject(writeCtx, model, 'o', 'struct');

        return [
            ...sizeCtx.lines,
            'const buf = Buffer.allocUnsafe(size);',
            ...writeCtx.lines,
            'return { buffer: buf, offset: o, size: o };',
        ].join('\n');
    }

    const ctx = createContext(endian, 'make', false);
    push(ctx, `const buf = Buffer.allocUnsafe(${staticSize});`);
    push(ctx, 'let o = 0;');
    generateWriteObject(ctx, model, 'o', 'struct');
    push(ctx, 'return { buffer: buf, offset: o, size: o };');
    return ctx.lines.join('\n');
}
