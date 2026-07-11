import { Model, Type } from '../types';
import { getAtomSize } from './atom-spec';
import { extractTypeAndSize, getDotGroups, getSpecialType, isVariableField, parseSizedAtom } from './type-utils';
import { ModelAnalysis } from './types';

function fieldStaticSize(modelKey: string, modelType: Type): number | undefined {
    const keyGroups = getDotGroups(modelKey);
    if (keyGroups) {
        const { specialType, isStatic, staticSize } = extractTypeAndSize(
            modelType as string,
            keyGroups.dynamicLength,
        );
        if (!isStatic || staticSize === 0) return undefined;
        if (specialType) {
            if (getSpecialType(modelType as string) !== undefined) {
                const base = modelType as string;
                if (base === 'ws' || base.startsWith('ws')) return staticSize * 2;
            }
            const sized = parseSizedAtom(modelType as string);
            if (sized?.base === 'ws') return staticSize * 2;
            return staticSize;
        }
        const atom = getAtomSize(modelType as string);
        return atom !== undefined ? atom * staticSize : undefined;
    }

    if (Array.isArray(modelType)) {
        let total = 0;
        for (const item of modelType) {
            const s = fieldSizeFromType(item);
            if (s === undefined) return undefined;
            total += s;
        }
        return total;
    }

    return fieldSizeFromType(modelType);
}

function fieldSizeFromType(modelType: Type): number | undefined {
    if (typeof modelType === 'object' && !Array.isArray(modelType)) {
        let total = 0;
        for (const [k, t] of Object.entries(modelType)) {
            const s = fieldStaticSize(k, t);
            if (s === undefined) return undefined;
            total += s;
        }
        return total;
    }

    if (Array.isArray(modelType)) {
        let total = 0;
        for (const item of modelType) {
            const s = fieldSizeFromType(item);
            if (s === undefined) return undefined;
            total += s;
        }
        return total;
    }

    if (typeof modelType !== 'string') return undefined;

    const typeGroups = getDotGroups(modelType);
    if (typeGroups) {
        const { isStatic, staticSize } = extractTypeAndSize(
            typeGroups.dynamicType,
            typeGroups.dynamicLength,
        );
        if (!isStatic) return undefined;
        if (staticSize === 0) return undefined;
        const atom = getAtomSize(typeGroups.dynamicType);
        if (atom === undefined) {
            const sized = parseSizedAtom(typeGroups.dynamicType);
            if (sized) {
                const byteSize = sized.base === 'ws' ? sized.size * 2 : sized.size;
                return byteSize * staticSize;
            }
            return undefined;
        }
        return atom * staticSize;
    }

    const atom = getAtomSize(modelType);
    if (atom !== undefined) return atom;

    const sized = parseSizedAtom(modelType);
    if (sized) {
        if (sized.size === 0) return undefined;
        return sized.base === 'ws' ? sized.size * 2 : sized.size;
    }

    if (modelType === 'j0') return undefined;

    return undefined;
}

function walkVariable(model: Model): boolean {
    if (Array.isArray(model)) {
        for (const item of model) {
            if (typeof item === 'string' && isVariableField('', item)) return true;
            if (typeof item === 'object' && walkVariable(item as Model)) return true;
        }
        return false;
    }

    for (const [key, type] of Object.entries(model)) {
        if (isVariableField(key, type)) return true;
        if (typeof type === 'object') {
            if (walkVariable(type as Model)) return true;
        }
    }
    return false;
}

export function analyzeModel(model: Model): ModelAnalysis {
    const hasVariableLength = walkVariable(model);
    const staticSize = hasVariableLength ? 0 : (fieldSizeFromType(model) ?? 0);
    return { hasVariableLength, staticSize };
}
