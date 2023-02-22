import { ReaderFunctions, WriterFunctions } from "./types";

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
            ['u8', ['uint8', 'unsigned char']],
            ['i8', ['int8', 'signed char']],

            ['u16', ['uint16', 'unsigned short']],
            ['u32', ['uint32', 'unsigned int']],
            ['u64', ['uint64', 'unsigned long']],

            ['i16', ['int16', 'signed short', 'short']],
            ['i32', ['int32', 'signed int', 'int']],
            ['i64', ['int64', 'signed long', 'long']],
        ];
        aliases.forEach(([type, aliases]) => this.addAlias(type, ...aliases));
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