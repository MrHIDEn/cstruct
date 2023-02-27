export class BaseBuffer {
    constructor() {
        this._atomTypes = `b8,b16,b32,b64,u8,u16,u32,u64,u8,i16,i32,i64,f,d,s`.split(',');
        this._stringAtom = /^s[0-9]+/;
    }
    isProtectedType(type) {
        return (this._atomTypes.includes(type) ||
            this._stringAtom.test(type));
    }
    addPredefinedAliases() {
        const aliases = [
            // TODO What bool should be? ['b8', ['bool']],
            ['b8', ['bool8']],
            ['b16', ['bool16']],
            ['b32', ['bool32']],
            ['b64', ['bool64']],
            ['u8', ['uint8', 'uint8_t', 'unsigned char']],
            ['u16', ['uint16', 'uint16_t', 'unsigned short']],
            ['u32', ['uint32', 'uint32_t', 'unsigned int']],
            ['u64', ['uint64', 'uint64_t', 'unsigned long']],
            ['i8', ['int8', 'int8_t', 'signed char']],
            ['i16', ['int16', 'int16_t', 'signed short', 'short']],
            ['i32', ['int32', 'int32_t', 'signed int', 'int']],
            ['i64', ['int64', 'int64_t', 'signed long', 'long']],
            ['f', ['float', 'float32', 'float32_t']],
            ['d', ['double', 'float64', 'float64_t']],
        ];
        aliases.forEach(([type, aliases]) => this.addAlias(type, ...aliases));
    }
    addUserAliases(aliases) {
        aliases.forEach((alias) => this.addAlias(alias.type, ...alias.aliases));
    }
    addAlias(type, ...alias) {
        alias.forEach((alias) => {
            if (this.isProtectedType(alias))
                throw new Error(`Atom types are protected.`);
            const reader = this._atomFunctions.get(type);
            this._atomFunctions.set(alias, reader);
        });
    }
}
//# sourceMappingURL=base-buffer.js.map