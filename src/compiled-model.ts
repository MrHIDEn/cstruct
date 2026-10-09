import { EnumModel, Model, SpecialType, Type } from './types';
import { isEnumModel } from './enum';
import { buildAliasMap } from './base-buffer';

/**
 * Compile the parsed model into a flat, pre-resolved tree once, so the hot
 * interpreter path (read/make) no longer runs `Object.entries` + regexes +
 * special-type lookups on every field on every call.
 *
 * The compiled node mirrors exactly what `Read.readSchema/readField` and
 * `Make.recursion/write` used to compute at runtime — only the decisions are
 * made once here, at construction time.
 */

export interface CompiledScalar {
    t: 0;
    /** Resolved atom type (e.g. 'u8', 's'); sized atoms are pre-split (s16 → 's' + size 16). */
    type: string;
    size?: number;
    json: boolean; // 'j0' → JSON.parse / JSON.stringify
    buf0: boolean; // invalid — throw at read/make
}

export interface CompiledEnum {
    t: 1;
    type: string;
    enumModel: EnumModel;
}

export interface CompiledDynamic {
    t: 2;
    lengthType: string; // type of the length prefix ('i16', 'u8', …) or a static size string
    isStatic: boolean;
    staticSize: number;
    special: SpecialType | 0; // 0 = array of items
    type: string; // special type ('s'/'ws'/'buf'/'j') or item type
    items: CompiledNode | null; // for the array case
}

export interface CompiledTuple {
    t: 3;
    items: CompiledNode[];
}

export interface CompiledObject {
    t: 4;
    fields: CompiledField[];
}

export interface CompiledField {
    key: string;
    node: CompiledNode;
}

export type CompiledNode = CompiledScalar | CompiledEnum | CompiledDynamic | CompiledTuple | CompiledObject;

const SPECIAL_MAP: Record<string, SpecialType> = {
    s: SpecialType.String,
    string: SpecialType.String,
    ws: SpecialType.WString,
    wstring: SpecialType.WString,
    buf: SpecialType.Buffer,
    buffer: SpecialType.Buffer,
    j: SpecialType.Json,
    json: SpecialType.Json,
    any: SpecialType.Json,
};

const SIZED_ATOM = /^(s|string|ws|wstring|buf|buffer|j|json|any)([0-9]+)$/;
const DYNAMIC = /^(\w+)\.(\w+)$/;

const ATOM_ALIAS = buildAliasMap();

function resolveAtom(type: string): string {
    return ATOM_ALIAS[type] ?? type;
}

function isStaticLength(len: string): boolean {
    return !Number.isNaN(+len);
}

function compileScalar(type: string): CompiledScalar {
    if (type === 'buf0') return { t: 0, type: 'buf', size: 0, json: false, buf0: true };
    if (type === 'j0') return { t: 0, type: 'j', size: 0, json: true, buf0: false };
    const m = SIZED_ATOM.exec(type);
    const base = m ? m[1] : type;
    return {
        t: 0,
        type: resolveAtom(base),
        size: m ? +m[2] : undefined,
        json: SPECIAL_MAP[base] === SpecialType.Json,
        buf0: false,
    };
}

function compileDynamic(type: Type, lengthType: string): CompiledDynamic {
    const special = typeof type === 'string' ? SPECIAL_MAP[type] : undefined;
    return {
        t: 2,
        lengthType: resolveAtom(lengthType),
        isStatic: isStaticLength(lengthType),
        staticSize: +lengthType,
        special: special ?? 0,
        type: typeof type === 'string' ? resolveAtom(type) : '',
        items: special ? null : compileType(type),
    };
}

function compileType(type: Type): CompiledNode {
    if (Array.isArray(type)) return { t: 3, items: type.map(compileType) };
    if (typeof type === 'string') {
        const m = DYNAMIC.exec(type);
        if (m) return compileDynamic(m[1], m[2]);
        return compileScalar(type);
    }
    if (isEnumModel(type)) return { t: 1, type: type.type, enumModel: type };
    return compileObject(type as object);
}

function compileObject(model: object): CompiledObject {
    const fields: CompiledField[] = [];
    for (const [key, type] of Object.entries(model)) {
        const m = DYNAMIC.exec(key);
        if (m) {
            fields.push({ key: m[1], node: compileDynamic(type as Type, m[2]) });
        } else {
            fields.push({ key, node: compileType(type as Type) });
        }
    }
    return { t: 4, fields };
}

function compileNode(model: Model): CompiledNode {
    if (Array.isArray(model)) return { t: 3, items: model.map((m) => compileType(m as Type)) };
    return compileObject(model as object);
}

const cache = new WeakMap<object, CompiledNode>();

export function compiledModel(model: Model): CompiledNode {
    const key = model as object;
    let c = cache.get(key);
    if (c === undefined) {
        c = compileNode(model);
        cache.set(key, c);
    }
    return c;
}
