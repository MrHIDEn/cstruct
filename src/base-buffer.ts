import { Alias, ReaderFunctions, WriterFunctions } from "./types";

export class BaseBuffer {
    private _atomTypes: string[] = `b8,b16,b32,b64,u8,u16,u32,u64,u8,i16,i32,i64,f,d,s`.split(',');
    private _stringAtom = /^s[0-9]+/;

    protected isProtectedType(type: string): boolean {
        return (
            this._atomTypes.includes(type) ||
            this._stringAtom.test(type)
        );
    }

    protected addPredefinedAliases() {
        const aliases: [type: string, aliases: string[]][] = [
            // TODO What bool should be? ['b8', ['bool']],
            ['b8', ['bool8', 'BOOL']],
            ['b16', ['bool16']],
            ['b32', ['bool32']],
            ['b64', ['bool64']],

            ['u8', ['uint8', 'uint8_t', 'unsigned char', 'BYTE']],
            ['u16', ['uint16', 'uint16_t', 'unsigned short', 'WORD']],
            ['u32', ['uint32', 'uint32_t', 'unsigned int', 'DWORD']],
            ['u64', ['uint64', 'uint64_t', 'unsigned long', 'LWORD']],

            ['i8', ['int8', 'int8_t', 'signed char', 'SINT']],
            ['i16', ['int16', 'int16_t', 'signed short', 'short', 'INT']],
            ['i32', ['int32', 'int32_t', 'signed int', 'int', 'DINT']],
            ['i64', ['int64', 'int64_t', 'signed long', 'long', 'LINT']],

            ['f', ['float', 'float32', 'float32_t', 'REAL']],
            ['d', ['double', 'float64', 'float64_t', 'LREAL']],
        ];
        aliases.forEach(([type, aliases]) => this.addAlias(type, ...aliases));
    }

    addUserAliases(aliases: Alias[]) {
        aliases.forEach(([type, ...aliasesList]) =>
                this.addAlias(type, ...aliasesList)
        );
    }

    addAlias(type: string, ...alias: string[]) {
        alias.forEach((alias) => {
            if (this.isProtectedType(alias)) throw new Error(`Atom types are protected.`);
            const reader = this._atomFunctions.get(type);
            this._atomFunctions.set(alias, reader);
        });
    }

    protected _atomFunctions: Map<string, WriterFunctions | ReaderFunctions>;
}