export class AtomTypes {
    static readonly BOOL: string = 'b8';
    static readonly B8: string = 'b8';
    static readonly B16: string = 'b16';
    static readonly B32: string = 'b32';
    static readonly B64: string = 'b64';
    static readonly U8: string = 'u8';
    static readonly U16: string = 'u16';
    static readonly U32: string = 'u32';
    static readonly U64: string = 'u64';
    static readonly BYTE: string = 'u8';
    static readonly WORD: string = 'u16';
    static readonly DWORD: string = 'u32';
    static readonly LWORD: string = 'u64';
    static readonly QWORD: string = 'u64';
    static readonly I8: string = 'i8';
    static readonly I16: string = 'i16';
    static readonly I32: string = 'i32';
    static readonly I64: string = 'i64';
    static readonly CHAR: string = 'i8';
    static readonly SINT: string = 'i8';
    static readonly INT: string = 'i16';
    static readonly DINT: string = 'i32';
    static readonly LINT: string = 'i64';
    static readonly QINT: string = 'i64';
    static readonly F: string = 'f';
    static readonly F32: string = 'f';
    static readonly REAL: string = 'f';
    static readonly D: string = 'd';
    static readonly F64: string = 'd';
    static readonly LREAL: string = 'd';
    static readonly S = (size: number | string) => Number.isFinite(size)
        ? /*{number}*/ `s${size}`      // S(0) -> End zero
        : /*{string}*/ `s[${size}]`;    // S("0") ->Trailing zero
    static readonly STR = AtomTypes.S;
    static readonly STRING = AtomTypes.S;
    static readonly SE0 = AtomTypes.S(0); // 's0'
    static readonly SEndZero = AtomTypes.S(0); // 's0' -> '{a: "s0"}' -> End zero
    static readonly ST0 = AtomTypes.S('0'); // 's[0]'
    static readonly STrailingZero = AtomTypes.S('0'); // 's[0]' -> '{a.0: "s"}' -> Trailing zero
    static readonly STREndZero = AtomTypes.SEndZero;
    static readonly STRINGEndZero = AtomTypes.SEndZero;
    static readonly STRTTrailingZero = AtomTypes.STrailingZero;
    static readonly STRINGTTrailingZero = AtomTypes.STrailingZero;
    static readonly WS = (size: number | string) => Number.isFinite(size)
    ? /*{number}*/ `ws${size}`      // S(0) -> End zero
    : /*{string}*/ `ws[${size}]`;    // S("0") ->Trailing zero
    static readonly WSTR = AtomTypes.WS;
    static readonly WSTRING = AtomTypes.WS;
    static readonly WSE0 = AtomTypes.WS(0); // 'ws0'
    static readonly WSEndZero = AtomTypes.WS(0); // 'ws0' -> '{a: "ws0"}' -> End zero
    static readonly WST0 = AtomTypes.WS('0'); // 'ws[0]'
    static readonly WSTrailingZero = AtomTypes.WS('0'); // 'ws[0]' -> '{a.0: "ws"}' -> Trailing zero
    static readonly WSTREndZero = AtomTypes.WSEndZero;
    static readonly WSTRINGEndZero = AtomTypes.WSEndZero;
    static readonly WSTTrailingZero = AtomTypes.WSTrailingZero;
    static readonly WSTRINGTTrailingZero = AtomTypes.WSTrailingZero;
    static readonly BUF = (size: number) => `buf${size}`;
    static readonly BUFFER = AtomTypes.BUF;
    static readonly J = (size: string | number) => Number.isFinite(size)
        ? /*{number}*/ `j${size}`       // J(0) -> End zero
        : /*{string}*/ `j[${size}]`;    // J("0") ->Trailing zero
    static readonly JSON = AtomTypes.J;
    static readonly ANY =  AtomTypes.J;

}

export type AtomType =
    typeof AtomTypes.BOOL |
    typeof AtomTypes.B8 |
    typeof AtomTypes.B16 |
    typeof AtomTypes.B32 |
    typeof AtomTypes.B64 |
    typeof AtomTypes.U8 |
    typeof AtomTypes.U16 |
    typeof AtomTypes.U32 |
    typeof AtomTypes.U64 |
    typeof AtomTypes.BYTE |
    typeof AtomTypes.WORD |
    typeof AtomTypes.DWORD |
    typeof AtomTypes.LWORD |
    typeof AtomTypes.QWORD |
    typeof AtomTypes.I8 |
    typeof AtomTypes.I16 |
    typeof AtomTypes.I32 |
    typeof AtomTypes.I64 |
    typeof AtomTypes.CHAR |
    typeof AtomTypes.SINT |
    typeof AtomTypes.INT |
    typeof AtomTypes.DINT |
    typeof AtomTypes.LINT |
    typeof AtomTypes.QINT |
    typeof AtomTypes.F |
    typeof AtomTypes.F32 |
    typeof AtomTypes.REAL |
    typeof AtomTypes.D |
    typeof AtomTypes.F64 |
    typeof AtomTypes.LREAL |
    typeof AtomTypes.S |
    typeof AtomTypes.STR |
    typeof AtomTypes.STRING |
    typeof AtomTypes.WS |
    typeof AtomTypes.WSTR |
    typeof AtomTypes.WSTRING |
    typeof AtomTypes.BUF |
    typeof AtomTypes.BUFFER |
    typeof AtomTypes.J |
    typeof AtomTypes.JSON |
    typeof AtomTypes.ANY |
    typeof AtomTypes.SE0 |
    typeof AtomTypes.SEndZero |
    typeof AtomTypes.ST0 |
    typeof AtomTypes.STrailingZero |
    typeof AtomTypes.STREndZero |
    typeof AtomTypes.STRINGEndZero |
    typeof AtomTypes.STRTTrailingZero |
    typeof AtomTypes.STRINGTTrailingZero;
