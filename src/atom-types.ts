export const BOOL = 'b8';
export const B8 = 'b8';
export const B16 = 'b16';
export const B32 = 'b32';
export const B64 = 'b64';

export const U8 = 'u8';
export const U16 = 'u16';
export const U32 = 'u32';
export const U64 = 'u64';
export const BYTE = 'u8';
export const WORD = 'u16';
export const DWORD = 'u32';
export const LWORD = 'u64';
export const QWORD = 'u64';

export const I8 = 'i8';
export const I16 = 'i16';
export const I32 = 'i32';
export const I64 = 'i64';
export const CHAR = 'i8';
export const SINT = 'i8';
export const INT = 'i16';
export const DINT = 'i32';
export const LINT = 'i64';
export const QINT = 'i64';

export const F = 'f';
export const F32 = 'f';
export const REAL = 'f';

export const D = 'd';
export const F64 = 'd';
export const LREAL = 'd';

export const S = (size: number) => `s${size}`;
export const STR = S;
export const STRING = S;

export const BUF = (size: number) => `buf${size}`;
export const BUFFER = BUF;

export const J = (sizeType: string) => `j[${sizeType}]`;
export const JSON = J;

export type AtomType =
    typeof BOOL |
    typeof B8 |
    typeof B16 |
    typeof B32 |
    typeof B64 |
    typeof U8 |
    typeof U16 |
    typeof U32 |
    typeof U64 |
    typeof BYTE |
    typeof WORD |
    typeof DWORD |
    typeof LWORD |
    typeof QWORD |
    typeof I8 |
    typeof I16 |
    typeof I32 |
    typeof I64 |
    typeof CHAR |
    typeof SINT |
    typeof INT |
    typeof DINT |
    typeof LINT |
    typeof QINT |
    typeof F |
    typeof F32 |
    typeof REAL |
    typeof D |
    typeof F64 |
    typeof LREAL |
    typeof S |
    typeof STR |
    typeof STRING |
    typeof BUF |
    typeof BUFFER |
    typeof J |
    typeof JSON;
