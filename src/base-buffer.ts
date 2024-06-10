import { Alias, ReaderFunctions, WriterFunctions } from "./types";

export class BaseBuffer {
    private _atomTypes: string[] = `b8,b16,b32,b64,u8,u16,u32,u64,u8,i16,i32,i64,f,d,s,ws,buf,j`.split(',');
    private _stringOrBufferAtomOrJson = /^(s|string|ws|wstring|buf|buffer|j|json|any)[0-9]+$/;
    protected _stringOrBufferAtomOrJsonGroups = /^(?<type>s|string|ws|wstring|buf|buffer|j|json|any)(?<size>[0-9]+)$/;

    protected isProtectedType(type: string): boolean {
        return (
            this._atomTypes.includes(type) ||
            this._stringOrBufferAtomOrJson.test(type)
        );
    }

    protected addPredefinedAliases() {
        const aliases: [type: string, ...aliases: string[]][] = [
            ['b8', 'B8', 'bool8', 'bool', 'BOOL'],
            ['b16', 'B16', 'bool16'],
            ['b32', 'B32', 'bool32'],
            ['b64', 'B64', 'bool64'],

            ['u8', 'U8', 'BYTE', 'uint8', 'uint8_t'],
            ['u16', 'U16', 'WORD', 'uint16', 'uint16_t'],
            ['u32', 'U32', 'DWORD', 'uint32', 'uint32_t'],
            ['u64', 'U64', 'QWORD','LWORD', 'uint64', 'uint64_t'],

            ['i8', 'I8', 'SINT', 'int8', 'int8_t'],
            ['i16', 'I16', 'INT', 'int16', 'int16_t'],
            ['i32', 'I32', 'DINT', 'int32', 'int32_t'],
            ['i64', 'I64', 'QINT', 'LINT', 'int64', 'int64_t'],

            ['f', 'F', 'REAL', 'f32', 'F32', 'float', 'float32', 'float32_t', 'single'],
            ['d', 'D', 'LREAL', 'f64', 'F64', 'double', 'float64', 'float64_t'],

            ['s', 'string', 'S', 'STR', 'STRING'],
            ['ws', 'wstring', 'WS', 'WSTR', 'WSTRING'],
            ['buf', 'buffer', 'BUF', 'BUFFER'],
            ['j', 'json', 'any', 'J', 'JSON'],
        ];
        this.addAliases(aliases);
    }

    addAliases(aliases: Alias[]) {
        aliases.forEach(([type, ...aliasesList]) =>
            aliasesList.forEach((alias) => {
                if (this.isProtectedType(alias)) throw new Error(`Atom types are protected.`);
                const reader = this._atomFunctions.get(type);
                this._atomFunctions.set(alias, reader);
            })
        );
    }

    protected _atomFunctions: Map<string, WriterFunctions | ReaderFunctions>;
}