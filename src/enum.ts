import { EnumModel, ModelValue, ReaderValue, WriterValue } from "./types";

/**
 * An enum model type is an object with exactly two fields:
 * - `type` — wire atom type, e.g. 'u8', 'i16', 'u32'
 * - `enum` — mapping of raw (wire) values to names, e.g. `{ 1: 'FOO', 2: 'BAR' }`
 *
 * Example model: `{ a: 'u8', b: { type: 'u8', enum: { 1: 'FOO', 2: 'BAR' } } }`
 * - read  -> `{ a: 1, b: 'BAR' }` (raw values not present in the map pass through unchanged)
 * - make  -> accepts a name (`'BAR'`) or a raw value (`2`)
 */
export function isEnumModel(modelType: unknown): modelType is EnumModel {
    if (typeof modelType !== 'object' || modelType === null || Array.isArray(modelType)) {
        return false;
    }
    const candidate = modelType as { [key: string]: unknown };
    return typeof candidate.type === 'string'
        && typeof candidate.enum === 'object'
        && candidate.enum !== null
        && !Array.isArray(candidate.enum);
}

/** Raw (wire) value -> enum name. Unknown raw values pass through unchanged. */
export function enumRawToName(model: EnumModel, raw: ReaderValue): ReaderValue {
    const name = Object.entries(model.enum)
        .find(([rawKey]) => String(raw) === rawKey)
        ?.[1];
    return name ?? raw;
}

/** Enum name (or raw value) -> raw (wire) value. Throws for unknown names. */
export function enumNameToRaw(model: EnumModel, value: WriterValue): ModelValue {
    if (typeof value === 'string') {
        const rawKey = Object.entries(model.enum)
            .find(([, name]) => name === value)
            ?.[0];
        if (rawKey === undefined) {
            throw new Error(`Unknown enum value "${value}".`);
        }
        const raw = +rawKey;
        return Number.isNaN(raw) ? rawKey : raw;
    }
    return value as ModelValue;
}
