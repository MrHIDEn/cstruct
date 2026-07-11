import { Endian } from './types';

export interface AtomSpec {
    size: number;
    readExpr: (offset: string) => string;
    writeExpr: (bufVar: string, offset: string, value: string) => string;
}

const E = (endian: Endian) => endian === 'le' ? 'LE' : 'BE';

const ATOM_SIZES: Record<string, number> = {
    b8: 1, u8: 1, i8: 1,
    b16: 2, u16: 2, i16: 2,
    b32: 4, u32: 4, i32: 4, f: 4,
    b64: 8, u64: 8, i64: 8, d: 8,
};

const TYPE_ALIASES: Record<string, string> = {
    B8: 'b8', BOOL8: 'b8', BOOL: 'b8', bool8: 'b8', bool: 'b8',
    B16: 'b16', bool16: 'b16',
    B32: 'b32', bool32: 'b32',
    B64: 'b64', bool64: 'b64',
    U8: 'u8', BYTE: 'u8', uint8: 'u8', uint8_t: 'u8',
    U16: 'u16', WORD: 'u16', uint16: 'u16', uint16_t: 'u16',
    U32: 'u32', DWORD: 'u32', uint32: 'u32', uint32_t: 'u32',
    U64: 'u64', QWORD: 'u64', LWORD: 'u64', uint64: 'u64', uint64_t: 'u64',
    I8: 'i8', SINT: 'i8', int8: 'i8', int8_t: 'i8', CHAR: 'i8',
    I16: 'i16', INT: 'i16', int16: 'i16', int16_t: 'i16',
    I32: 'i32', DINT: 'i32', int32: 'i32', int32_t: 'i32',
    I64: 'i64', QINT: 'i64', LINT: 'i64', int64: 'i64', int64_t: 'i64',
    F: 'f', F32: 'f', REAL: 'f', float: 'f', float32: 'f', float32_t: 'f', single: 'f', f32: 'f',
    D: 'd', F64: 'd', LREAL: 'd', double: 'd', float64: 'd', float64_t: 'd', f64: 'd',
};

export function resolveAtomType(type: string): string {
    return TYPE_ALIASES[type] ?? type;
}

export function getAtomSize(type: string): number | undefined {
    return ATOM_SIZES[resolveAtomType(type)];
}

export function getAtomSpec(type: string, endian: Endian): AtomSpec | undefined {
    type = resolveAtomType(type);
    const size = ATOM_SIZES[type];
    if (!size) return undefined;
    const EDN = E(endian);

    switch (type) {
        case 'b8':
            return {
                size,
                readExpr: (o) => `Boolean(buf.readInt8(${o}))`,
                writeExpr: (b, o, v) => `${b}.writeInt8(${v} ? 1 : 0, ${o})`,
            };
        case 'u8':
            return {
                size,
                readExpr: (o) => `buf.readUInt8(${o})`,
                writeExpr: (b, o, v) => `${b}.writeUInt8(${v}, ${o})`,
            };
        case 'i8':
            return {
                size,
                readExpr: (o) => `buf.readInt8(${o})`,
                writeExpr: (b, o, v) => `${b}.writeInt8(${v}, ${o})`,
            };
        case 'b16':
            return {
                size,
                readExpr: (o) => `Boolean(buf.readInt16${EDN}(${o}))`,
                writeExpr: (b, o, v) => `${b}.writeInt16${EDN}(${v} ? 1 : 0, ${o})`,
            };
        case 'u16':
            return {
                size,
                readExpr: (o) => `buf.readUInt16${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeUInt16${EDN}(${v}, ${o})`,
            };
        case 'i16':
            return {
                size,
                readExpr: (o) => `buf.readInt16${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeInt16${EDN}(${v}, ${o})`,
            };
        case 'b32':
            return {
                size,
                readExpr: (o) => `Boolean(buf.readInt32${EDN}(${o}))`,
                writeExpr: (b, o, v) => `${b}.writeInt32${EDN}(${v} ? 1 : 0, ${o})`,
            };
        case 'u32':
            return {
                size,
                readExpr: (o) => `buf.readUInt32${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeUInt32${EDN}(${v}, ${o})`,
            };
        case 'i32':
            return {
                size,
                readExpr: (o) => `buf.readInt32${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeInt32${EDN}(${v}, ${o})`,
            };
        case 'f':
            return {
                size,
                readExpr: (o) => `buf.readFloat${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeFloat${EDN}(${v}, ${o})`,
            };
        case 'b64':
            return {
                size,
                readExpr: (o) => `Boolean(buf.readBigInt64${EDN}(${o}))`,
                writeExpr: (b, o, v) => `${b}.writeBigInt64${EDN}(BigInt(${v}), ${o})`,
            };
        case 'u64':
            return {
                size,
                readExpr: (o) => `buf.readBigUInt64${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeBigUInt64${EDN}(BigInt(${v}), ${o})`,
            };
        case 'i64':
            return {
                size,
                readExpr: (o) => `buf.readBigInt64${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeBigInt64${EDN}(BigInt(${v}), ${o})`,
            };
        case 'd':
            return {
                size,
                readExpr: (o) => `buf.readDouble${EDN}(${o})`,
                writeExpr: (b, o, v) => `${b}.writeDouble${EDN}(${v}, ${o})`,
            };
        default:
            return undefined;
    }
}

export function getLengthPrefixSpec(lengthType: string, endian: Endian): AtomSpec {
    const spec = getAtomSpec(lengthType, endian);
    if (!spec) {
        throw new Error(`Unsupported dynamic length type "${lengthType}".`);
    }
    return spec;
}
