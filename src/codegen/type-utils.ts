import { SpecialType, Type } from '../types';

const DYNAMIC_DOT = /^(?<dynamicType>\w+)\.(?<dynamicLength>\w+)$/;
const SIZED_ATOM = /^(?<base>s|ws|buf|j)(?<size>\d+)$/;

export interface DotGroups {
    dynamicType: string;
    dynamicLength: string;
}

export function getDotGroups(key: string): DotGroups | undefined {
    const groups = key.match(DYNAMIC_DOT)?.groups;
    if (!groups?.dynamicType || !groups?.dynamicLength) return undefined;
    return { dynamicType: groups.dynamicType, dynamicLength: groups.dynamicLength };
}

export function getSpecialType(base: string): SpecialType | undefined {
    switch (base) {
        case 's':
        case 'string':
            return SpecialType.String;
        case 'ws':
        case 'wstring':
            return SpecialType.WString;
        case 'buf':
        case 'buffer':
            return SpecialType.Buffer;
        case 'j':
        case 'json':
        case 'any':
            return SpecialType.Json;
        default:
            return undefined;
    }
}

export function parseSizedAtom(type: string): { base: string; size: number } | undefined {
    const m = type.match(SIZED_ATOM);
    if (!m?.groups) return undefined;
    return { base: m.groups.base, size: +m.groups.size };
}

export function isLengthNumeric(length: string): boolean {
    return !Number.isNaN(+length);
}

export function extractTypeAndSize(modelType: string, dynamicLength: string) {
    const specialType = getSpecialType(modelType);
    const n = +dynamicLength;
    const isStatic = !Number.isNaN(n);
    return { specialType, isStatic, staticSize: n };
}

export function isDynamicLengthType(length: string): boolean {
    return !isLengthNumeric(length);
}

export function isVariableField(modelKey: string, modelType: Type): boolean {
    const keyGroups = getDotGroups(modelKey);
    if (keyGroups) {
        const { staticSize } = extractTypeAndSize(modelType as string, keyGroups.dynamicLength);
        return staticSize === 0 || isDynamicLengthType(keyGroups.dynamicLength);
    }
    if (typeof modelType === 'string') {
        const typeGroups = getDotGroups(modelType);
        if (typeGroups) {
            return !isLengthNumeric(typeGroups.dynamicLength)
                || +typeGroups.dynamicLength === 0;
        }
        const sized = parseSizedAtom(modelType);
        if (sized && sized.size === 0) return true;
        if (modelType === 'j0') return true;
    }
    return false;
}
