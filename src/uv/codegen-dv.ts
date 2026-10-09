import { Model, ModelValue, SpecialType, Type } from '../types';
import { resolveAtomType, getAtomSize } from '../codegen/atom-spec';
import {
    extractTypeAndSize,
    getDotGroups,
    getSpecialType,
    parseSizedAtom,
} from '../codegen/type-utils';
import { isEnumModel } from '../enum';

/**
 * Variant B codegen — same model walker as the Buffer codegen, but the generated
 * bodies run on DataView over a plain Uint8Array (browser-ready, no Buffer).
 * Endianness is baked into the code at compile time; text helpers are passed
 * via the `_h` parameter (one shared module-level object).
 */

export interface DvHelpers {
    td: InstanceType<typeof TextDecoder>;
    td16: InstanceType<typeof TextDecoder>;
    te: InstanceType<typeof TextEncoder>;
    w16(target: Uint8Array, start: number, str: string, maxBytes: number): void;
}

export const DV_HELPERS: DvHelpers = {
    td: new TextDecoder('utf-8'),
    td16: new TextDecoder('utf-16le'),
    te: new TextEncoder(),
    w16(target: Uint8Array, start: number, str: string, maxBytes: number) {
        const n = Math.min(str.length, maxBytes >> 1);
        for (let i = 0; i < n; i++) {
            const c = str.charCodeAt(i);
            target[start + i * 2] = c & 0xff;
            target[start + i * 2 + 1] = (c >> 8) & 0xff;
        }
    },
};

export type CompiledReadUvFn<T = unknown> = (bytes: Uint8Array, off?: number) => {
    struct: T;
    offset: number;
    size: number;
};
export type CompiledWriteUvFn<T = unknown> = (struct: T, bytes: Uint8Array, off?: number) => {
    bytes: Uint8Array;
    offset: number;
    size: number;
};
export type CompiledMakeUvFn<T = unknown> = (struct: T) => {
    bytes: Uint8Array;
    offset: number;
    size: number;
};

interface DvCtx {
    le: boolean;
    lines: string[];
    counter: number;
    /** 'size' — emit `size += …`; 'write' — emit actual reads/writes. */
    phase: 'size' | 'write';
}

function tmpId(ctx: DvCtx): string {
    return `_t${ctx.counter++}`;
}

function push(ctx: DvCtx, line: string) {
    ctx.lines.push(line);
}

function quotedKey(key: string): string {
    return JSON.stringify(key);
}

function structProp(structExpr: string, key: string): string {
    return `${structExpr}[${quotedKey(key)}]`;
}

function LE(ctx: DvCtx): string {
    return ctx.le ? 'true' : 'false';
}

// --- atom read/write expressions (DataView) ---

function atomReadExpr(type: string, ctx: DvCtx, offset: string): string {
    type = resolveAtomType(type);
    const le = LE(ctx);
    switch (type) {
        case 'b8': return `Boolean(dv.getInt8(${offset}))`;
        case 'u8': return `dv.getUint8(${offset})`;
        case 'i8': return `dv.getInt8(${offset})`;
        case 'b16': return `Boolean(dv.getInt16(${offset}, ${le}))`;
        case 'u16': return `dv.getUint16(${offset}, ${le})`;
        case 'i16': return `dv.getInt16(${offset}, ${le})`;
        case 'b32': return `Boolean(dv.getInt32(${offset}, ${le}))`;
        case 'u32': return `dv.getUint32(${offset}, ${le})`;
        case 'i32': return `dv.getInt32(${offset}, ${le})`;
        case 'b64': return `Boolean(dv.getBigInt64(${offset}, ${le}))`;
        case 'u64': return `dv.getBigUint64(${offset}, ${le})`;
        case 'i64': return `dv.getBigInt64(${offset}, ${le})`;
        case 'f': return `dv.getFloat32(${offset}, ${le})`;
        case 'd': return `dv.getFloat64(${offset}, ${le})`;
        default: return '';
    }
}

function atomWriteStmt(type: string, ctx: DvCtx, offset: string, value: string): string {
    type = resolveAtomType(type);
    const le = LE(ctx);
    switch (type) {
        case 'b8': return `dv.setInt8(${offset}, (${value}) ? 1 : 0); ${offset} += 1;`;
        case 'u8': return `dv.setUint8(${offset}, ${value}); ${offset} += 1;`;
        case 'i8': return `dv.setInt8(${offset}, ${value}); ${offset} += 1;`;
        case 'b16': return `dv.setInt16(${offset}, (${value}) ? 1 : 0, ${le}); ${offset} += 2;`;
        case 'u16': return `dv.setUint16(${offset}, ${value}, ${le}); ${offset} += 2;`;
        case 'i16': return `dv.setInt16(${offset}, ${value}, ${le}); ${offset} += 2;`;
        case 'b32': return `dv.setInt32(${offset}, (${value}) ? 1 : 0, ${le}); ${offset} += 4;`;
        case 'u32': return `dv.setUint32(${offset}, ${value}, ${le}); ${offset} += 4;`;
        case 'i32': return `dv.setInt32(${offset}, ${value}, ${le}); ${offset} += 4;`;
        case 'b64': return `dv.setBigInt64(${offset}, BigInt(${value}), ${le}); ${offset} += 8;`;
        case 'u64': return `dv.setBigUint64(${offset}, BigInt(${value}), ${le}); ${offset} += 8;`;
        case 'i64': return `dv.setBigInt64(${offset}, BigInt(${value}), ${le}); ${offset} += 8;`;
        case 'f': return `dv.setFloat32(${offset}, ${value}, ${le}); ${offset} += 4;`;
        case 'd': return `dv.setFloat64(${offset}, ${value}, ${le}); ${offset} += 8;`;
        default: return '';
    }
}

// --- string/buffer emits ---

function readStringUtf8Dv(ctx: DvCtx, o: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = _h.td.decode(bytes.subarray(${o}, ${o} + ${sizeExpr})).split('\\0')[0]; ${o} += ${sizeExpr};`);
}

function readStringUtf8TrailingDv(ctx: DvCtx, o: string, target: string) {
    push(ctx, `{ let _e = ${o}; while (_e < bytes.length && bytes[_e] !== 0) _e++; const _s = (_e < bytes.length ? _e - ${o} + 1 : bytes.length - ${o}); ${target} = _h.td.decode(bytes.subarray(${o}, ${o} + _s)).split('\\0')[0]; ${o} += _s; }`);
}

function readWStringDv(ctx: DvCtx, o: string, byteSizeExpr: string, target: string) {
    push(ctx, `${target} = _h.td16.decode(bytes.subarray(${o}, ${o} + ${byteSizeExpr})).split('\\u0000')[0]; ${o} += ${byteSizeExpr};`);
}

function readWStringTrailingDv(ctx: DvCtx, o: string, target: string) {
    push(ctx, `{ let _e = ${o}; while (_e + 1 < bytes.length && (bytes[_e] !== 0 || bytes[_e + 1] !== 0)) _e += 2; const _s = (_e + 1 < bytes.length ? _e - ${o} + 2 : bytes.length - ${o}); ${target} = _h.td16.decode(bytes.subarray(${o}, ${o} + _s)).split('\\u0000')[0]; ${o} += _s; }`);
}

function readBufferDv(ctx: DvCtx, o: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = bytes.slice(${o}, ${o} + ${sizeExpr}); ${o} += ${sizeExpr};`);
}

function writeStringUtf8Dv(ctx: DvCtx, o: string, valueExpr: string, size: number | string, trailing = false, dynamic = false) {
    if (ctx.phase === 'size') {
        if (trailing) {
            push(ctx, `size += (${valueExpr}).length + 1;`);
        } else if (dynamic) {
            push(ctx, `size += (${valueExpr}).length;`);
        } else {
            push(ctx, `size += ${size};`);
        }
        return;
    }
    if (trailing) {
        push(ctx, `{ const _b = (${valueExpr}).length; _h.te.encodeInto(${valueExpr}, bytes.subarray(${o}, ${o} + _b)); bytes[${o} + _b] = 0; ${o} += _b + 1; }`);
    } else if (dynamic) {
        push(ctx, `{ const _b = (${valueExpr}).length; _h.te.encodeInto(${valueExpr}, bytes.subarray(${o}, ${o} + _b)); ${o} += _b; }`);
    } else {
        push(ctx, `bytes.fill(0, ${o}, ${o} + ${size}); _h.te.encodeInto(${valueExpr}, bytes.subarray(${o}, ${o} + ${size})); ${o} += ${size};`);
    }
}

function writeWStringDv(ctx: DvCtx, o: string, valueExpr: string, size: number | string, trailing = false) {
    const byteSize = typeof size === 'number' ? size * 2 : `(${size}) * 2`;
    if (ctx.phase === 'size') {
        if (trailing) {
            push(ctx, `size += (${valueExpr}).length * 2 + 2;`);
        } else {
            push(ctx, `size += ${byteSize};`);
        }
        return;
    }
    if (trailing) {
        push(ctx, `{ const _b = (${valueExpr}).length * 2; _h.w16(bytes, ${o}, ${valueExpr}, _b); dv.setUint16(${o} + _b, 0, ${LE(ctx)}); ${o} += _b + 2; }`);
    } else {
        push(ctx, `bytes.fill(0, ${o}, ${o} + ${byteSize}); _h.w16(bytes, ${o}, ${valueExpr}, ${byteSize}); ${o} += ${byteSize};`);
    }
}

function writeWStringDynamicDv(ctx: DvCtx, o: string, valueExpr: string) {
    if (ctx.phase === 'size') {
        push(ctx, `size += (${valueExpr}).length * 2;`);
        return;
    }
    push(ctx, `{ const _b = (${valueExpr}).length * 2; _h.w16(bytes, ${o}, ${valueExpr}, _b); ${o} += _b; }`);
}

function writeBufferFieldDv(ctx: DvCtx, o: string, valueExpr: string, size: number) {
    if (ctx.phase === 'size') {
        push(ctx, `size += ${size};`);
        return;
    }
    push(ctx, `bytes.set((${valueExpr}).subarray(0, ${size}), ${o}); ${o} += ${size};`);
}

// --- scalar/dynamic field emit ---

function readAtomDv(ctx: DvCtx, type: string, o: string, target: string) {
    const expr = atomReadExpr(type, ctx, o);
    if (!expr) throw new Error(`Unknown type ${type}`);
    const size = getAtomSize(type);
    if (!size) throw new Error(`Unknown type ${type}`);
    push(ctx, `${target} = ${expr}; ${o} += ${size};`);
}

function writeAtomDv(ctx: DvCtx, type: string, o: string, valueExpr: string) {
    const size = getAtomSize(type);
    if (!size) throw new Error(`Unknown type ${type}`);
    if (ctx.phase === 'size') {
        push(ctx, `size += ${size};`);
        return;
    }
    const stmt = atomWriteStmt(type, ctx, o, valueExpr);
    if (!stmt) throw new Error(`Unknown type ${type}`);
    push(ctx, stmt);
}

function readScalarTypeDv(ctx: DvCtx, modelType: string, o: string, target: string) {
    if (modelType === 'buf0') {
        throw new Error('Buffer size can not be 0. (read)');
    }

    const atomSize = getAtomSize(modelType);
    if (atomSize) {
        readAtomDv(ctx, modelType, o, target);
        return;
    }

    const sized = parseSizedAtom(modelType);
    if (sized) {
        const special = getSpecialType(sized.base);
        if (special === SpecialType.String) {
            if (sized.size === 0) {
                readStringUtf8TrailingDv(ctx, o, target);
            } else {
                readStringUtf8Dv(ctx, o, String(sized.size), target);
            }
            return;
        }
        if (special === SpecialType.WString) {
            const bytes = sized.size * 2;
            if (sized.size === 0) {
                readWStringTrailingDv(ctx, o, target);
            } else {
                readWStringDv(ctx, o, String(bytes), target);
            }
            return;
        }
        if (special === SpecialType.Buffer) {
            readBufferDv(ctx, o, String(sized.size), target);
            return;
        }
        if (special === SpecialType.Json) {
            if (sized.size === 0) {
                readStringUtf8TrailingDv(ctx, o, target);
                push(ctx, `${target} = JSON.parse(${target});`);
            } else {
                const raw = tmpId(ctx);
                readStringUtf8Dv(ctx, o, String(sized.size), raw);
                push(ctx, `${target} = JSON.parse(${raw});`);
            }
            return;
        }
    }

    if (modelType === 'j0') {
        const raw = tmpId(ctx);
        readStringUtf8TrailingDv(ctx, o, raw);
        push(ctx, `${target} = JSON.parse(${raw});`);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

function writeScalarTypeDv(ctx: DvCtx, modelType: string, o: string, valueExpr: string) {
    if (modelType === 'buf0') {
        throw new Error('Buffer size can not be 0. (make)');
    }

    const atomSize = getAtomSize(modelType);
    if (atomSize) {
        writeAtomDv(ctx, modelType, o, valueExpr);
        return;
    }

    const sized = parseSizedAtom(modelType);
    if (sized) {
        const special = getSpecialType(sized.base);
        if (special === SpecialType.String) {
            writeStringUtf8Dv(ctx, o, valueExpr, sized.size, sized.size === 0);
            return;
        }
        if (special === SpecialType.WString) {
            writeWStringDv(ctx, o, valueExpr, sized.size, sized.size === 0);
            return;
        }
        if (special === SpecialType.Buffer) {
            writeBufferFieldDv(ctx, o, valueExpr, sized.size);
            return;
        }
        if (special === SpecialType.Json) {
            writeStringUtf8Dv(ctx, o, `JSON.stringify(${valueExpr})`, sized.size, sized.size === 0);
            return;
        }
    }

    if (modelType === 'j0') {
        writeStringUtf8Dv(ctx, o, `JSON.stringify(${valueExpr})`, 0, true);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

function dynamicPayloadLengthExprDv(
    structKeyExpr: string,
    valueExpr: string,
    specialType: SpecialType | undefined,
    isStatic: boolean,
    staticSize: number,
): string {
    if (isStatic) return String(staticSize);
    if (specialType === SpecialType.Json || specialType === SpecialType.String) {
        return `(${valueExpr}).length`;
    }
    if (specialType === SpecialType.WString) {
        return `(${structKeyExpr}).length`;
    }
    return `${structKeyExpr}.length`;
}

function readLengthDv(ctx: DvCtx, lengthType: string, o: string): string {
    const size = getAtomSize(lengthType);
    if (!size) {
        throw new Error(`Unsupported dynamic length type "${lengthType}".`);
    }
    const expr = atomReadExpr(lengthType, ctx, o);
    const id = tmpId(ctx);
    push(ctx, `const ${id} = ${expr}; ${o} += ${size};`);
    return id;
}

function writeLengthDv(ctx: DvCtx, lengthType: string, o: string, value: string) {
    const size = getAtomSize(lengthType);
    if (!size) {
        throw new Error(`Unsupported dynamic length type "${lengthType}".`);
    }
    if (ctx.phase === 'size') {
        push(ctx, `size += ${size};`);
        return;
    }
    const stmt = atomWriteStmt(lengthType, ctx, o, value);
    push(ctx, stmt);
}

function readArrayItemsDv(ctx: DvCtx, itemsType: Type, sizeExpr: string, o: string, target: string) {
    push(ctx, `${target} = [];`);
    const i = tmpId(ctx);
    push(ctx, `for (let ${i} = 0; ${i} < ${sizeExpr}; ${i}++) {`);
    if (typeof itemsType === 'object' && !Array.isArray(itemsType)) {
        const elem = tmpId(ctx);
        push(ctx, `const ${elem} = {};`);
        generateReadObjectDv(ctx, itemsType as Model, o, elem);
        push(ctx, `${target}[${i}] = ${elem};`);
    } else if (typeof itemsType === 'string') {
        const elem = tmpId(ctx);
        readFieldDv(ctx, itemsType, o, elem);
        push(ctx, `${target}[${i}] = ${elem};`);
    } else if (Array.isArray(itemsType)) {
        const elem = tmpId(ctx);
        push(ctx, `const ${elem} = [];`);
        generateReadTupleDv(ctx, itemsType, o, elem, `${i}`);
        push(ctx, `${target}[${i}] = ${elem};`);
    } else {
        throw new TypeError(`Unknown type "${itemsType}"`);
    }
    push(ctx, '}');
}

function writeArrayItemsDv(ctx: DvCtx, itemsType: Type, structArrayExpr: string, o: string) {
    if (ctx.phase === 'size' && typeof itemsType === 'string') {
        const size = getAtomSize(itemsType);
        if (size) {
            push(ctx, `size += ${structArrayExpr}.length * ${size};`);
            return;
        }
    }

    const i = tmpId(ctx);
    push(ctx, `for (let ${i} = 0; ${i} < ${structArrayExpr}.length; ${i}++) {`);
    if (typeof itemsType === 'object' && !Array.isArray(itemsType)) {
        generateWriteObjectDv(ctx, itemsType as Model, o, `${structArrayExpr}[${i}]`);
    } else if (typeof itemsType === 'string') {
        writeFieldDv(ctx, itemsType, o, `${structArrayExpr}[${i}]`);
    } else {
        throw new TypeError(`Unknown type "${itemsType}"`);
    }
    push(ctx, '}');
}

function readDynamicOrStaticDv(
    ctx: DvCtx,
    modelType: string,
    dynamicLength: string,
    readType: string,
    o: string,
    target: string,
) {
    const { specialType, isStatic, staticSize } = extractTypeAndSize(modelType, dynamicLength);
    let sizeExpr: string;

    if (isStatic) {
        sizeExpr = String(staticSize);
    } else {
        sizeExpr = readLengthDv(ctx, dynamicLength, o);
    }

    if (+sizeExpr === 0 && specialType === SpecialType.Buffer) {
        throw new Error('Buffer size can not be 0.');
    }

    if (specialType) {
        if (specialType === SpecialType.Json) {
            const raw = tmpId(ctx);
            if (isStatic && staticSize === 0) {
                readStringUtf8TrailingDv(ctx, o, raw);
            } else {
                readStringUtf8Dv(ctx, o, sizeExpr, raw);
            }
            push(ctx, `${target} = JSON.parse(${raw});`);
            return;
        }
        if (specialType === SpecialType.String) {
            if (isStatic && staticSize === 0) {
                readStringUtf8TrailingDv(ctx, o, target);
            } else {
                readStringUtf8Dv(ctx, o, sizeExpr, target);
            }
            return;
        }
        if (specialType === SpecialType.WString) {
            const byteSize = isStatic && staticSize > 0 ? `${staticSize * 2}` : `(${sizeExpr}) * 2`;
            if (isStatic && staticSize === 0) {
                readWStringTrailingDv(ctx, o, target);
            } else {
                readWStringDv(ctx, o, byteSize, target);
            }
            return;
        }
        if (specialType === SpecialType.Buffer) {
            readBufferDv(ctx, o, sizeExpr, target);
            return;
        }
    }

    readArrayItemsDv(ctx, readType, sizeExpr, o, target);
}

function writeDynamicOrStaticDv(
    ctx: DvCtx,
    modelType: string,
    dynamicLength: string,
    structKeyExpr: string,
    writeType: string,
    o: string,
) {
    const { specialType, isStatic, staticSize } = extractTypeAndSize(modelType, dynamicLength);

    let valueExpr = structKeyExpr;
    if (specialType === SpecialType.Json) {
        valueExpr = `JSON.stringify(${structKeyExpr})`;
    }

    if (isStatic && staticSize !== 0 && specialType !== SpecialType.String && ctx.phase === 'write') {
        push(ctx, `if (${structKeyExpr}.length > ${staticSize}) throw new Error('Size of value ' + ${structKeyExpr}.length + ' is greater than ${staticSize}.');`);
    }

    const sizeExpr = dynamicPayloadLengthExprDv(structKeyExpr, valueExpr, specialType, isStatic, staticSize);

    if (+sizeExpr === 0 && specialType === SpecialType.Buffer) {
        throw new Error('Buffer size can not be 0.');
    }

    if (!isStatic) {
        writeLengthDv(ctx, dynamicLength, o, sizeExpr);
    }

    if (specialType) {
        if (specialType === SpecialType.String) {
            if (isStatic && staticSize === 0) {
                writeStringUtf8Dv(ctx, o, structKeyExpr, 0, true);
            } else if (!isStatic) {
                writeStringUtf8Dv(ctx, o, structKeyExpr, 0, false, true);
            } else {
                writeStringUtf8Dv(ctx, o, structKeyExpr, staticSize);
            }
            return;
        }
        if (specialType === SpecialType.WString) {
            if (isStatic && staticSize === 0) {
                writeWStringDv(ctx, o, structKeyExpr, 0, true);
            } else if (!isStatic) {
                writeWStringDynamicDv(ctx, o, structKeyExpr);
            } else {
                writeWStringDv(ctx, o, structKeyExpr, staticSize);
            }
            return;
        }
        if (specialType === SpecialType.Buffer) {
            if (isStatic) {
                writeBufferFieldDv(ctx, o, structKeyExpr, staticSize);
            } else {
                throw new Error('Dynamic buffer without static size is not supported in write path.');
            }
            return;
        }
        if (specialType === SpecialType.Json) {
            if (isStatic && staticSize === 0) {
                writeStringUtf8Dv(ctx, o, valueExpr, 0, true);
            } else if (!isStatic) {
                writeStringUtf8Dv(ctx, o, valueExpr, 0, false, true);
            } else {
                writeStringUtf8Dv(ctx, o, valueExpr, staticSize);
            }
            return;
        }
    }

    writeArrayItemsDv(ctx, writeType, structKeyExpr, o);
}

function readFieldDv(ctx: DvCtx, modelType: Type, o: string, target: string) {
    if (Array.isArray(modelType)) {
        push(ctx, `${target} = [];`);
        generateReadTupleDv(ctx, modelType, o, target, '');
        return;
    }

    if (typeof modelType === 'string') {
        const typeGroups = getDotGroups(modelType);
        if (typeGroups) {
            readDynamicOrStaticDv(
                ctx,
                typeGroups.dynamicType,
                typeGroups.dynamicLength,
                typeGroups.dynamicType,
                o,
                target,
            );
            return;
        }
        readScalarTypeDv(ctx, modelType, o, target);
        return;
    }

    if (typeof modelType === 'object') {
        if (isEnumModel(modelType)) {
            throw new TypeError(`Enum model type is not supported in compiled functions (read). Use .read() instead.`);
        }
        push(ctx, `${target} = {};`);
        generateReadObjectDv(ctx, modelType as Model, o, target);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

function writeFieldDv(ctx: DvCtx, modelType: Type, o: string, valueExpr: string) {
    if (Array.isArray(modelType)) {
        for (let i = 0; i < modelType.length; i++) {
            writeFieldDv(ctx, modelType[i], o, `${valueExpr}[${i}]`);
        }
        return;
    }

    if (typeof modelType === 'object' && !Array.isArray(modelType)) {
        if (isEnumModel(modelType)) {
            throw new TypeError(`Enum model type is not supported in compiled functions (write). Use .make()/.write() instead.`);
        }
        generateWriteObjectDv(ctx, modelType as Model, o, valueExpr);
        return;
    }

    if (typeof modelType === 'string') {
        const typeGroups = getDotGroups(modelType);
        if (typeGroups) {
            writeDynamicOrStaticDv(
                ctx,
                typeGroups.dynamicType,
                typeGroups.dynamicLength,
                valueExpr,
                typeGroups.dynamicType,
                o,
            );
            return;
        }
        writeScalarTypeDv(ctx, modelType, o, valueExpr);
        return;
    }

    throw new TypeError(`Unknown type "${modelType}"`);
}

type TupleModel = ModelValue[];

function generateReadTupleDv(ctx: DvCtx, model: TupleModel, o: string, target: string, indexPrefix: string) {
    for (let i = 0; i < model.length; i++) {
        const itemType = model[i];
        const idx = indexPrefix ? `${indexPrefix}[${i}]` : String(i);
        const elem = tmpId(ctx);
        readFieldDv(ctx, itemType as Type, o, elem);
        push(ctx, `${target}[${idx}] = ${elem};`);
    }
}

function generateReadObjectDv(ctx: DvCtx, model: Model, o: string, target: string) {
    if (Array.isArray(model)) {
        generateReadTupleDv(ctx, model as ModelValue[], o, target, '');
        return;
    }

    for (const [modelKey, modelType] of Object.entries(model)) {
        const keyGroups = getDotGroups(modelKey);
        if (keyGroups) {
            const { dynamicType, dynamicLength } = keyGroups;
            const val = tmpId(ctx);
            readDynamicOrStaticDv(ctx, modelType as string, dynamicLength, modelType as string, o, val);
            push(ctx, `${structProp(target, dynamicType)} = ${val};`);
            continue;
        }

        if (typeof modelType === 'string') {
            const typeGroups = getDotGroups(modelType);
            if (typeGroups) {
                const val = tmpId(ctx);
                readDynamicOrStaticDv(ctx, typeGroups.dynamicType, typeGroups.dynamicLength, typeGroups.dynamicType, o, val);
                push(ctx, `${structProp(target, modelKey)} = ${val};`);
                continue;
            }
        }

        const val = tmpId(ctx);
        readFieldDv(ctx, modelType, o, val);
        push(ctx, `${structProp(target, modelKey)} = ${val};`);
    }
}

function generateWriteObjectDv(ctx: DvCtx, model: Model, o: string, structExpr: string) {
    if (Array.isArray(model)) {
        for (let i = 0; i < model.length; i++) {
            writeFieldDv(ctx, model[i], o, `${structExpr}[${i}]`);
        }
        return;
    }

    for (const [modelKey, modelType] of Object.entries(model)) {
        const keyGroups = getDotGroups(modelKey);
        if (keyGroups) {
            const { dynamicType, dynamicLength } = keyGroups;
            writeDynamicOrStaticDv(ctx, modelType as string, dynamicLength, structProp(structExpr, dynamicType), modelType as string, o);
            continue;
        }

        if (typeof modelType === 'string') {
            const typeGroups = getDotGroups(modelType);
            if (typeGroups) {
                writeDynamicOrStaticDv(ctx, typeGroups.dynamicType, typeGroups.dynamicLength, structProp(structExpr, modelKey), typeGroups.dynamicType, o);
                continue;
            }
        }

        writeFieldDv(ctx, modelType, o, structProp(structExpr, modelKey));
    }
}

// --- body generators ---

export function generateReadBodyDv(model: Model, le: boolean): string {
    const ctx: DvCtx = { le, lines: [], counter: 0, phase: 'write' };
    push(ctx, 'off = off || 0;');
    push(ctx, 'let o = off;');
    push(ctx, 'const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);');
    const root = tmpId(ctx);
    if (Array.isArray(model)) {
        push(ctx, `const ${root} = [];`);
        generateReadTupleDv(ctx, model as ModelValue[], 'o', root, '');
    } else {
        push(ctx, `const ${root} = {};`);
        generateReadObjectDv(ctx, model, 'o', root);
    }
    push(ctx, `return { struct: ${root}, offset: o, size: o - off };`);
    return ctx.lines.join('\n');
}

export function generateWriteBodyDv(model: Model, le: boolean): string {
    const sizeCtx: DvCtx = { le, lines: [], counter: 0, phase: 'size' };
    push(sizeCtx, 'let size = 0;');
    generateWriteObjectDv(sizeCtx, model, 'o', 'struct');

    const writeCtx: DvCtx = { le, lines: [], counter: 0, phase: 'write' };
    push(writeCtx, 'let o = off;');
    generateWriteObjectDv(writeCtx, model, 'o', 'struct');

    return [
        'off = off || 0;',
        ...sizeCtx.lines,
        'if (size > bytes.length - off) throw new Error("Write buffer is too short. Needs " + (size - (bytes.length - off)) + " byte/s more.");',
        'const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);',
        ...writeCtx.lines,
        'return { bytes, offset: o, size: size };',
    ].join('\n');
}

export function generateMakeBodyDv(model: Model, le: boolean, hasVariableLength: boolean, staticSize: number): string {
    const sizeCtx: DvCtx = { le, lines: [], counter: 0, phase: 'size' };
    push(sizeCtx, 'let size = 0;');
    generateWriteObjectDv(sizeCtx, model, 'o', 'struct');

    const writeCtx: DvCtx = { le, lines: [], counter: 0, phase: 'write' };
    push(writeCtx, 'let o = 0;');
    generateWriteObjectDv(writeCtx, model, 'o', 'struct');

    if (hasVariableLength) {
        return [
            ...sizeCtx.lines,
            'const bytes = new Uint8Array(size);',
            'const dv = new DataView(bytes.buffer);',
            ...writeCtx.lines,
            'return { bytes, offset: o, size: o };',
        ].join('\n');
    }

    return [
        `const bytes = new Uint8Array(${staticSize});`,
        'const dv = new DataView(bytes.buffer);',
        ...writeCtx.lines,
        'return { bytes, offset: o, size: o };',
    ].join('\n');
}
