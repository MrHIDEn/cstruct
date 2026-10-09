import { EnumModel, Model, ModelValue, SpecialType, Type } from '../types';
import { resolveAtomType, getAtomSize } from '../codegen/atom-spec';
import {
    extractTypeAndSize,
    getDotGroups,
    getSpecialType,
    parseSizedAtom,
} from '../codegen/type-utils';
import { isEnumModel } from '../enum';
import { readUtf8, readUtf16, writeUtf8, utf8Length } from './utf';

/**
 * Variant B codegen — same model walker as the Buffer codegen, but the generated
 * bodies run on DataView over a plain Uint8Array (browser-ready, no Buffer).
 * Endianness is baked into the code at compile time; text helpers are passed
 * via the `_h` parameter (one shared module-level object).
 */

export interface DvHelpers {
    readUtf8(bytes: Uint8Array, start: number, end: number): string;
    readUtf16(bytes: Uint8Array, start: number, end: number): string;
    writeUtf8(bytes: Uint8Array, start: number, str: string, maxBytes: number): number;
    utf8Length(str: string): number;
    /** Shared scratch DataView for float/double/bigint byte conversion (no per-call alloc). */
    dv: DataView;
    readF(bytes: Uint8Array, o: number, le: boolean): number;
    readD(bytes: Uint8Array, o: number, le: boolean): number;
    readU64(bytes: Uint8Array, o: number, le: boolean): bigint;
    readI64(bytes: Uint8Array, o: number, le: boolean): bigint;
    w16(target: Uint8Array, start: number, str: string, maxBytes: number): void;
}

const SCRATCH = new DataView(new ArrayBuffer(8));

export const DV_HELPERS: DvHelpers = {
    readUtf8,
    readUtf16,
    writeUtf8,
    utf8Length,
    dv: SCRATCH,
    readF(bytes: Uint8Array, o: number, le: boolean): number {
        SCRATCH.setUint8(0, bytes[o]);
        SCRATCH.setUint8(1, bytes[o + 1]);
        SCRATCH.setUint8(2, bytes[o + 2]);
        SCRATCH.setUint8(3, bytes[o + 3]);
        return SCRATCH.getFloat32(0, le);
    },
    readD(bytes: Uint8Array, o: number, le: boolean): number {
        for (let i = 0; i < 8; i++) SCRATCH.setUint8(i, bytes[o + i]);
        return SCRATCH.getFloat64(0, le);
    },
    readU64(bytes: Uint8Array, o: number, le: boolean): bigint {
        for (let i = 0; i < 8; i++) SCRATCH.setUint8(i, bytes[o + i]);
        return SCRATCH.getBigUint64(0, le);
    },
    readI64(bytes: Uint8Array, o: number, le: boolean): bigint {
        for (let i = 0; i < 8; i++) SCRATCH.setUint8(i, bytes[o + i]);
        return SCRATCH.getBigInt64(0, le);
    },
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

// --- atom read/write expressions (direct byte access, no per-call DataView) ---

function atomReadExpr(type: string, ctx: DvCtx, offset: string): string {
    type = resolveAtomType(type);
    const le = ctx.le;
    const b = (i: number) => `bytes[${offset} + ${i}]`;
    switch (type) {
        case 'u8': return `${b(0)}`;
        case 'i8': return `(${b(0)} << 24) >> 24`;
        case 'b8': return `Boolean((${b(0)} << 24) >> 24)`;
        case 'u16': return le ? `${b(0)} | (${b(1)} << 8)` : `(${b(0)} << 8) | ${b(1)}`;
        case 'i16': return le ? `(${b(0)} | (${b(1)} << 8)) << 16 >> 16` : `((${b(0)} << 8) | ${b(1)}) << 16 >> 16`;
        case 'b16': return le ? `Boolean((${b(0)} | (${b(1)} << 8)) << 16 >> 16)` : `Boolean(((${b(0)} << 8) | ${b(1)}) << 16 >> 16)`;
        case 'u32': return le ? `(${b(0)} | (${b(1)} << 8) | (${b(2)} << 16) | (${b(3)} << 24)) >>> 0` : `((${b(0)} << 24) | (${b(1)} << 16) | (${b(2)} << 8) | ${b(3)}) >>> 0`;
        case 'i32': return le ? `${b(0)} | (${b(1)} << 8) | (${b(2)} << 16) | (${b(3)} << 24)` : `(${b(0)} << 24) | (${b(1)} << 16) | (${b(2)} << 8) | ${b(3)}`;
        case 'b32': return le ? `Boolean(${b(0)} | (${b(1)} << 8) | (${b(2)} << 16) | (${b(3)} << 24))` : `Boolean((${b(0)} << 24) | (${b(1)} << 16) | (${b(2)} << 8) | ${b(3)})`;
        case 'u64': return `_h.readU64(bytes, ${offset}, ${le})`;
        case 'i64': return `_h.readI64(bytes, ${offset}, ${le})`;
        case 'b64': return `Boolean(_h.readI64(bytes, ${offset}, ${le}))`;
        case 'f': return `_h.readF(bytes, ${offset}, ${le})`;
        case 'd': return `_h.readD(bytes, ${offset}, ${le})`;
        default: return '';
    }
}

// --- direct byte writes (no per-call DataView) ---

function byteExpr(value: string, shift: number): string {
    if (shift === 0) return `(${value}) & 0xff`;
    return `((${value}) >> ${shift}) & 0xff`;
}

/** Emit integer bytes written directly to `bytes[]` (little- or big-endian). */
function directIntWrite(offset: string, value: string, size: number, le: boolean): string {
    const stores: string[] = [];
    for (let i = 0; i < size; i++) {
        const shift = le ? i * 8 : (size - 1 - i) * 8;
        stores.push(`bytes[${offset} + ${i}] = ${byteExpr(value, shift)};`);
    }
    return `${stores.join(' ')} ${offset} += ${size};`;
}

/** Emit a float/double/bigint write via the shared scratch DataView. */
function scratchWrite(offset: string, value: string, size: number, le: boolean, setter: string): string {
    const stores: string[] = [];
    for (let i = 0; i < size; i++) {
        stores.push(`bytes[${offset} + ${i}] = _h.dv.getUint8(${i});`);
    }
    return `_h.dv.${setter}(0, ${value}, ${le}); ${stores.join(' ')} ${offset} += ${size};`;
}

function atomWriteStmt(type: string, ctx: DvCtx, offset: string, value: string): string {
    type = resolveAtomType(type);
    const le = ctx.le;
    switch (type) {
        case 'b8': return directIntWrite(offset, `(${value}) ? 1 : 0`, 1, le);
        case 'u8': return directIntWrite(offset, value, 1, le);
        case 'i8': return directIntWrite(offset, value, 1, le);
        case 'b16': return directIntWrite(offset, `(${value}) ? 1 : 0`, 2, le);
        case 'u16': return directIntWrite(offset, value, 2, le);
        case 'i16': return directIntWrite(offset, value, 2, le);
        case 'b32': return directIntWrite(offset, `(${value}) ? 1 : 0`, 4, le);
        case 'u32': return directIntWrite(offset, value, 4, le);
        case 'i32': return directIntWrite(offset, value, 4, le);
        case 'b64': return scratchWrite(offset, `BigInt((${value}) ? 1 : 0)`, 8, le, 'setBigInt64');
        case 'u64': return scratchWrite(offset, `BigInt(${value})`, 8, le, 'setBigUint64');
        case 'i64': return scratchWrite(offset, `BigInt(${value})`, 8, le, 'setBigInt64');
        case 'f': return scratchWrite(offset, value, 4, le, 'setFloat32');
        case 'd': return scratchWrite(offset, value, 8, le, 'setFloat64');
        default: return '';
    }
}

// --- string/buffer emits ---

function readStringUtf8Dv(ctx: DvCtx, o: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = _h.readUtf8(bytes, ${o}, ${o} + ${sizeExpr}); ${o} += ${sizeExpr};`);
}

function readStringUtf8TrailingDv(ctx: DvCtx, o: string, target: string) {
    push(ctx, `{ let _e = ${o}; while (_e < bytes.length && bytes[_e] !== 0) _e++; const _s = (_e < bytes.length ? _e - ${o} + 1 : bytes.length - ${o}); ${target} = _h.readUtf8(bytes, ${o}, ${o} + _s); ${o} += _s; }`);
}

function readWStringDv(ctx: DvCtx, o: string, byteSizeExpr: string, target: string) {
    push(ctx, `${target} = _h.readUtf16(bytes, ${o}, ${o} + ${byteSizeExpr}); ${o} += ${byteSizeExpr};`);
}

function readWStringTrailingDv(ctx: DvCtx, o: string, target: string) {
    push(ctx, `{ let _e = ${o}; while (_e + 1 < bytes.length && (bytes[_e] !== 0 || bytes[_e + 1] !== 0)) _e += 2; const _s = (_e + 1 < bytes.length ? _e - ${o} + 2 : bytes.length - ${o}); ${target} = _h.readUtf16(bytes, ${o}, ${o} + _s); ${o} += _s; }`);
}

function readBufferDv(ctx: DvCtx, o: string, sizeExpr: string, target: string) {
    push(ctx, `${target} = bytes.slice(${o}, ${o} + ${sizeExpr}); ${o} += ${sizeExpr};`);
}

function writeStringUtf8Dv(ctx: DvCtx, o: string, valueExpr: string, size: number | string, trailing = false, dynamic = false, lenExpr?: string) {
    if (ctx.phase === 'size') {
        if (trailing) {
            push(ctx, `size += _h.utf8Length(${valueExpr}) + 1;`);
        } else if (dynamic) {
            push(ctx, `size += _h.utf8Length(${valueExpr});`);
        } else {
            push(ctx, `size += ${size};`);
        }
        return;
    }
    if (trailing) {
        push(ctx, `{ const _b = _h.utf8Length(${valueExpr}); _h.writeUtf8(bytes, ${o}, ${valueExpr}, _b); bytes[${o} + _b] = 0; ${o} += _b + 1; }`);
    } else if (dynamic) {
        if (lenExpr) {
            push(ctx, `_h.writeUtf8(bytes, ${o}, ${valueExpr}, ${lenExpr}); ${o} += ${lenExpr};`);
        } else {
            push(ctx, `{ const _b = _h.utf8Length(${valueExpr}); _h.writeUtf8(bytes, ${o}, ${valueExpr}, _b); ${o} += _b; }`);
        }
    } else {
        push(ctx, `bytes.fill(0, ${o}, ${o} + ${size}); _h.writeUtf8(bytes, ${o}, ${valueExpr}, ${size}); ${o} += ${size};`);
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
        push(ctx, `{ const _b = (${valueExpr}).length * 2; _h.w16(bytes, ${o}, ${valueExpr}, _b); bytes[${o} + _b] = 0; bytes[${o} + _b + 1] = 0; ${o} += _b + 2; }`);
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

function writeBufferDynamicDv(ctx: DvCtx, o: string, valueExpr: string) {
    if (ctx.phase === 'size') {
        push(ctx, `size += (${valueExpr}).length;`);
        return;
    }
    push(ctx, `bytes.set(${valueExpr}, ${o}); ${o} += (${valueExpr}).length;`);
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
        return `_h.utf8Length(${valueExpr})`;
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
        if (isEnumModel(itemsType)) {
            const elem = tmpId(ctx);
            readEnumDv(ctx, itemsType, o, elem);
            push(ctx, `${target}[${i}] = ${elem};`);
        } else {
            const elem = tmpId(ctx);
            push(ctx, `const ${elem} = {};`);
            generateReadObjectDv(ctx, itemsType as Model, o, elem);
            push(ctx, `${target}[${i}] = ${elem};`);
        }
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
        if (isEnumModel(itemsType)) {
            writeEnumDv(ctx, itemsType, o, `${structArrayExpr}[${i}]`);
        } else {
            generateWriteObjectDv(ctx, itemsType as Model, o, `${structArrayExpr}[${i}]`);
        }
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
        const jsonId = tmpId(ctx);
        push(ctx, `const ${jsonId} = JSON.stringify(${structKeyExpr});`);
        valueExpr = jsonId;
    }

    if (isStatic && staticSize !== 0 && specialType !== SpecialType.String && ctx.phase === 'write') {
        push(ctx, `if (${valueExpr}.length > ${staticSize}) throw new Error('Size of value ' + ${valueExpr}.length + ' is greater than ${staticSize}.');`);
    }

    // For a dynamic string/json, compute the UTF-8 byte length once (write phase)
    // and reuse it for both the length prefix and the string write.
    let lenExpr: string | undefined;
    if (!isStatic && (specialType === SpecialType.String || specialType === SpecialType.Json) && ctx.phase === 'write') {
        lenExpr = tmpId(ctx);
        push(ctx, `const ${lenExpr} = _h.utf8Length(${valueExpr});`);
    }

    const sizeExpr = lenExpr ?? dynamicPayloadLengthExprDv(structKeyExpr, valueExpr, specialType, isStatic, staticSize);

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
                writeStringUtf8Dv(ctx, o, structKeyExpr, 0, false, true, lenExpr);
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
                writeBufferDynamicDv(ctx, o, structKeyExpr);
            }
            return;
        }
        if (specialType === SpecialType.Json) {
            if (isStatic && staticSize === 0) {
                writeStringUtf8Dv(ctx, o, valueExpr, 0, true);
            } else if (!isStatic) {
                writeStringUtf8Dv(ctx, o, valueExpr, 0, false, true, lenExpr);
            } else {
                writeStringUtf8Dv(ctx, o, valueExpr, staticSize);
            }
            return;
        }
    }

    writeArrayItemsDv(ctx, writeType, structKeyExpr, o);
}

function readEnumDv(ctx: DvCtx, enumModel: EnumModel, o: string, target: string) {
    const expr = atomReadExpr(enumModel.type, ctx, o);
    const size = getAtomSize(enumModel.type);
    if (!expr || !size) throw new Error(`Unknown type ${enumModel.type}`);
    const raw = tmpId(ctx);
    const table = JSON.stringify(enumModel.enum);
    push(ctx, `{ const ${raw} = ${expr}; ${o} += ${size}; ${target} = ${table}[String(${raw})] ?? ${raw}; }`);
}

function writeEnumDv(ctx: DvCtx, enumModel: EnumModel, o: string, valueExpr: string) {
    const size = getAtomSize(enumModel.type);
    if (!size) throw new Error(`Unknown type ${enumModel.type}`);
    if (ctx.phase === 'size') {
        push(ctx, `size += ${size};`);
        return;
    }
    const nameToRaw: Record<string, number | string> = {};
    for (const [rawKey, name] of Object.entries(enumModel.enum)) {
        nameToRaw[name] = Number.isNaN(+rawKey) ? rawKey : +rawKey;
    }
    const table = JSON.stringify(nameToRaw);
    const v = tmpId(ctx);
    push(ctx, `let ${v} = ${valueExpr}; if (typeof ${v} === 'string') { ${v} = ${table}[${v}]; if (${v} === undefined) throw new Error('Unknown enum value "' + ${valueExpr} + '".'); }`);
    const stmt = atomWriteStmt(enumModel.type, ctx, o, v);
    if (!stmt) throw new Error(`Unknown type ${enumModel.type}`);
    push(ctx, stmt);
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
            readEnumDv(ctx, modelType, o, target);
            return;
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
            writeEnumDv(ctx, modelType, o, valueExpr);
            return;
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

    const writeCtx: DvCtx = { le, lines: [], counter: sizeCtx.counter, phase: 'write' };
    push(writeCtx, 'let o = off;');
    generateWriteObjectDv(writeCtx, model, 'o', 'struct');

    return [
        'off = off || 0;',
        ...sizeCtx.lines,
        'if (size > bytes.length - off) throw new Error("Write buffer is too short. Needs " + (size - (bytes.length - off)) + " byte/s more.");',
        ...writeCtx.lines,
        'return { bytes, offset: o, size: size };',
    ].join('\n');
}

export function generateMakeBodyDv(model: Model, le: boolean, hasVariableLength: boolean, staticSize: number): string {
    const sizeCtx: DvCtx = { le, lines: [], counter: 0, phase: 'size' };
    push(sizeCtx, 'let size = 0;');
    generateWriteObjectDv(sizeCtx, model, 'o', 'struct');

    const writeCtx: DvCtx = { le, lines: [], counter: sizeCtx.counter, phase: 'write' };
    push(writeCtx, 'let o = 0;');
    generateWriteObjectDv(writeCtx, model, 'o', 'struct');

    if (hasVariableLength) {
        return [
            ...sizeCtx.lines,
            'const bytes = new Uint8Array(size);',
            ...writeCtx.lines,
            'return { bytes, offset: o, size: o };',
        ].join('\n');
    }

    return [
        `const bytes = new Uint8Array(${staticSize});`,
        ...writeCtx.lines,
        'return { bytes, offset: o, size: o };',
    ].join('\n');
}
