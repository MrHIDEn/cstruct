import {
    Model,
    Types,
    CStructReadResult,
    CStructWriteResult,
    ReaderValue,
    WriterValue,
    ReaderFunctions,
    WriterFunctions,
} from "../src/types";

export class ReadBuffer {
    _buffer: Buffer;
    _offset: number;
    _beginOffset: number;

    _readers = new Map<string, ReaderFunctions>([
        ['b', () => Boolean(this._u8())],
        ['u8', () => this._u8()],
        ['i8', () => this._i8()],
        ['s', (size: number) => this._s(size)],
    ]);

    constructor(buffer: Buffer, offset= 0) {
        this._buffer = buffer;
        this._offset = offset;
        this._beginOffset = offset;
    }

    _u8() {
        const val = this._buffer.readUInt8(this._offset);
        this._offset += 1;
        return val;
    }

    _i8() {
        const val = this._buffer.readInt8(this._offset);
        this._offset += 1;
        return val;
    }

    _s(size: number) {
        if (!size || size < 0) {
            throw new Error(`Invalid string size ${size ?? typeof size}`);
        }
        const val = this._buffer.toString('utf8', this._offset, this._offset + size);
        this._offset += size;
        return val;
    }

    addAlias(alias: string, type: string) {
        if (this._readers.has(type)) {
            throw new Error(`Type ${type} already exists`);
        }
        const reader = this._readers.get(type);
        this._readers.set(alias, reader);
    }

    read(type: string): ReaderValue {
        let size: number;
        if (type[0] === 's') {
            const match = type.match(/^s(\d+)$/);
            if (match) {
                type = 's';
                size = +match[1];
            }
        }
        if (this._readers.has(type)) {
            const reader = this._readers.get(type);
            return reader(size);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    }

    get size() {
        return this._offset - this._beginOffset;
    }

    get offset() {
        return this._offset;
    }
}

export class ReadBufferBE extends ReadBuffer {
    constructor(buffer: Buffer, offset= 0) {
        super(buffer, offset);
        [
            ['u16', () => this._u16()],
            ['i16', () => this._i16()],
            ['u32', () => this._u32()],
            ['i32', () => this._i32()],
            ['u64', () => this._u64()],
            ['i64', () => this._i64()],
            ['f', () => this._f()],
            ['d', () => this._d()],
        ].forEach(([type, fn]: [string, any]) => this._readers.set(type, fn));
    }

    _u16() {
        const val = this._buffer.readUInt16BE(this._offset);
        this._offset += 2;
        return val;
    }

    _i16() {
        const val = this._buffer.readInt16BE(this._offset);
        this._offset += 2;
        return val;
    }

    _u32() {
        const val = this._buffer.readUInt32BE(this._offset);
        this._offset += 4;
        return val;
    }

    _i32() {
        const val = this._buffer.readInt32BE(this._offset);
        this._offset += 4;
        return val;
    }

    _u64() {
        const val = this._buffer.readBigUInt64BE(this._offset);
        this._offset += 8;
        return val;
    }

    _i64() {
        const val = this._buffer.readBigInt64BE(this._offset);
        this._offset += 8;
        return val;
    }

    _f() {
        const val = this._buffer.readFloatBE(this._offset);
        this._offset += 4;
        return val;
    }

    _d() {
        const val = this._buffer.readDoubleBE(this._offset);
        this._offset += 8;
        return val;
    }
}

export class ReadBufferLE extends ReadBuffer {
    constructor(buffer: Buffer, offset= 0) {
        super(buffer, offset);
        [
            ['u16', () => this._u16()],
            ['i16', () => this._i16()],
            ['u32', () => this._u32()],
            ['i32', () => this._i32()],
            ['u64', () => this._u64()],
            ['i64', () => this._i64()],
            ['f', () => this._f()],
            ['d', () => this._d()],
        ].forEach(([type, fn]: [string, any]) => this._readers.set(type, fn));
    }

    _u16() {
        const val = this._buffer.readUInt16LE(this._offset);
        this._offset += 2;
        return val;
    }

    _i16() {
        const val = this._buffer.readInt16LE(this._offset);
        this._offset += 2;
        return val;
    }

    _u32() {
        const val = this._buffer.readUInt32LE(this._offset);
        this._offset += 4;
        return val;
    }

    _i32() {
        const val = this._buffer.readInt32LE(this._offset);
        this._offset += 4;
        return val;
    }

    _u64() {
        const val = this._buffer.readBigUInt64LE(this._offset);
        this._offset += 8;
        return val;
    }

    _i64() {
        const val = this._buffer.readBigInt64LE(this._offset);
        this._offset += 8;
        return val;
    }

    _f() {
        const val = this._buffer.readFloatLE(this._offset);
        this._offset += 4;
        return val;
    }

    _d() {
        const val = this._buffer.readDoubleLE(this._offset);
        this._offset += 8;
        return val;
    }
}

export class WriteBuffer {
    protected _buffers: Buffer[] = [];
    protected _offset= 0;

    protected _writers = new Map<string, WriterFunctions>([
        ['b', (val: boolean) => this._u8(+Boolean(val))],
        ['u8', (val: number) => this._u8(val)],
        ['i8', (val: number) => this._i8(val)],
        ['s', (val: string, size?: number) => this._s(val, size)],
    ]);

    private _u8(val= 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(val);
        this._buffers.push(buffer);
        this._offset += 1;
    }

    private _i8(val= 0) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(val);
        this._buffers.push(buffer);
        this._offset += 1;
    }

    private _s(val: string = '', size?: number) {
        if (typeof val !== 'string') {
            throw new Error(`Invalid string value ${val}`);
        }

        let buffer: Buffer;
        if (size === undefined) {
            size = val.length;
            buffer = Buffer.allocUnsafe(size);
            buffer.write(val, 0, size);
        } else {
            if (size < 0) {
                throw new Error(`Invalid string size ${size}`);
            }
            buffer = Buffer.allocUnsafe(size);
            buffer.write(val.padEnd(size, '\0'), 0, size);
        }

        this._buffers.push(buffer);
        this._offset += size;
    }

    addAlias(alias: string, type: string) {
        if (this._writers.has(type)) {
            throw new Error(`Type ${type} already exists`);
        }
        const reader = this._writers.get(type);
        this._writers.set(alias, reader);
    }

    write(type: string, val: WriterValue) {
        let size: number;
        if (type[0] === 's') {
            const match = type.match(/^s(\d+)$/);
            if (match) {
                type = 's';
                size = +match[1];
            }
        }
        if (this._writers.has(type)) {
            const writer = this._writers.get(type);
            writer(val, size);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    }

    get buffer(): Buffer {
        return this.toBuffer();
    }

    toBuffer(): Buffer {
        return Buffer.concat(this._buffers);
    }

    get size(): number {
        return this._offset;
    }

    get size2(): number {
        return this._buffers.reduce((acc, b) => acc + b.length, 0);
    }
}

export class WriteBufferBE extends WriteBuffer {
    constructor() {
        super();
        [
            ['u16', (val= 0) => this._u16(val)],
            ['i16', (val= 0) => this._i16(val)],
            ['u32', (val= 0) => this._u32(val)],
            ['i32', (val= 0) => this._i32(val)],
            ['u64', (val: bigint = 0n) => this._u64(val)],
            ['i64', (val: bigint = 0n) => this._i64(val)],
            ['f', (val= 0) => this._f(val)],
            ['d', (val= 0) => this._d(val)],
        ].forEach(([type, writer]: [string, WriterFunctions]) => this._writers.set(type, writer));
    }

    _u16(val= 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16BE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }

    _i16(val= 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16BE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }

    _u32(val= 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _i32(val= 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32BE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _u64(val: bigint = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64BE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }

    _i64(val: bigint = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64BE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }

    _f(val= 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatBE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _d(val= 0) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleBE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }
}

export class WriteBufferLE extends WriteBuffer {
    constructor() {
        super();
        [
            ['u16', (val= 0) => this._u16(val)],
            ['i16', (val= 0) => this._i16(val)],
            ['u32', (val= 0) => this._u32(val)],
            ['i32', (val= 0) => this._i32(val)],
            ['u64', (val: bigint = 0n) => this._u64(val)],
            ['i64', (val: bigint = 0n) => this._i64(val)],
            ['f', (val= 0) => this._f(val)],
            ['d', (val= 0) => this._d(val)],
        ].forEach(([type, writer]: [string, WriterFunctions]) => this._writers.set(type, writer));
    }

    _u16(val= 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16LE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }

    _i16(val= 0) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16LE(val);
        this._buffers.push(buffer);
        this._offset += 2;
    }

    _u32(val= 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32LE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _i32(val= 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32LE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _u64(val: bigint = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64LE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }

    _i64(val: bigint = 0n) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64LE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }

    _f(val= 0) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatLE(val);
        this._buffers.push(buffer);
        this._offset += 4;
    }

    _d(val= 0) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleLE(val);
        this._buffers.push(buffer);
        this._offset += 8;
    }
}

export class Make<T> {
    _writer: WriteBufferLE | WriteBufferBE;

    _recursion(model: Model, struct: T) {
        const entries = Object.entries(model);
        let keyArray: string;
        let keyString: string;

        for (let [key, type] of entries) {
            // Dynamic array.
            if (typeof keyArray === 'string') {
                this._writeDynamicArray(keyArray, key, struct, model, type);
                keyArray = undefined;
                continue;
            }
            // Dynamic string.
            else if (typeof keyString === 'string') {
                this._writeDynamicString(keyString, key, model, struct);
                keyString = undefined;
                continue;
            }

            // Prepare dynamic array.
            if (key.endsWith('.array')) {
                keyArray = key;
                continue;
            }
            // Prepare dynamic string.
            else if (key.endsWith('.string')) {
                keyString = key;
                continue;
            }
            // Normal item/items
            else {
                keyArray = undefined;
                keyString = undefined;
            }

            // Write item
            this._write(model, struct, key, type);
        }
    }

    /**
     * Writing dynamic array. Array length is written before array items.
     * <stringLength><string>
     */
    private _writeDynamicArray(keyArray: string, key, struct: T, model: object | any[] | string, type) {
        if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'aKey' must follow array declaration 'aKey.array'.`);
        if (!Array.isArray(struct[key])) throw SyntaxError(`An array 'aKey' must follow array declaration 'aKey.array'.`);

        // Write array length
        const typeLength = model[keyArray];
        const arrayLength = struct[key].length;
        this._writer.write(typeLength, arrayLength);

        // Write array items
        const itemsType = model[key];
        switch (typeof itemsType) {
            case 'object':
                for (const structItem of struct[key]) {
                    this._recursion(itemsType, structItem);
                }
                break;
            case 'string':
                for (const itemValue of struct[key]) {
                    this._writer.write(itemsType, itemValue);
                }
                break;
            default:
                throw TypeError(`Unknown type "${type}"`);
        }
    }

    /**
     * Writing dynamic string. String length is written before string.
     * <stringLength><string>
     */
    private _writeDynamicString(keyString: string, key, model: object | any[] | string, struct: T) {
        if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'aKey' must follow string declaration 'aKey.string'.`);
        if (model[key] != 'string') throw SyntaxError(`An object 'aKey' must be type 'string' after string declaration 'aKey.string'.`);
        if (typeof struct[key] != 'string') throw SyntaxError(`An followed 'aKey' must equal 'string' after declaration 'aKey.string'.`);

        // Write string length
        const stringValue = struct[key];
        const typeLength = model[keyString];
        const stringLength = stringValue.length;
        this._writer.write(typeLength, stringLength);

        // Write string
        this._writer.write('s', stringValue);
    }

    _write(model: Model, struct: T, key: string, type: string) {
        switch (typeof type) {
            case 'object':
                this._recursion(model[key], struct[key]);
                break;
            case 'string':
                this._writer.write(type, struct[key]);
                break;
            default:
                throw TypeError(`Unknown type "${type}"`);
        }
    }

    toBuffer() {
        return this._writer.toBuffer();
    }

    get offset() {
        return this._writer.size;
    }

    get size() {
        return this._writer.size;
    }

    getBufferAndOffset() {
        return [this.toBuffer(), this.offset];
    }
}

export class MakeBE<T> extends Make<T> {
    constructor(model: Model, struct: T) {
        super();
        this._writer = new WriteBufferBE();
        this._recursion(model, struct);
    }
}

export class MakeLE<T> extends Make<T> {
    constructor(model: Model, struct: T) {
        super();
        this._writer = new WriteBufferLE();
        this._recursion(model, struct);
    }
}

export class Write<T> extends Make<T> {
    _buffer: Buffer;
    _offset: number;

    constructor(buffer: Buffer, offset= 0) {
        super();
        this._buffer = buffer;
        this._offset = offset;
    }

    toBuffer() {
        this._writer.toBuffer().copy(this._buffer, this._offset);
        return this._buffer;
    }

    get offset() {
        return this._offset + this.size;
    }
}

export class WriteBE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset= 0) {
        super(buffer, offset);
        this._writer = new WriteBufferBE();
        this._recursion(model, struct);
    }
}

export class WriteLE<T> extends Write<T> {
    constructor(model: Model, struct: T, buffer: Buffer, offset= 0) {
        super(buffer, offset);
        this._writer = new WriteBufferLE();
        this._recursion(model, struct);
    }
}

export class Read<T> {
    _struct: T;
    _reader: ReadBufferLE | ReadBufferBE;

    _recursion(struct: T) {
        const entries = Object.entries(struct);
        let keyArray;
        let keyString;

        for (let [key, type] of entries) {
            // Dynamic array.
            if (typeof keyArray === 'string') {
                this._readDynamicArray(keyArray, key, struct);
                keyArray = undefined;
                continue;
            }
            // Dynamic string.
            else if (typeof keyString === 'string') {
                this._readDynamicString(keyString, key, struct);
                keyString = undefined;
                continue;
            }

            // Prepare dynamic array.
            if (key.endsWith('.array')) {
                keyArray = key;
                continue;
            }
            // Prepare dynamic string.
            else if (key.endsWith('.string')) {
                keyString = key;
                continue;
            }
            // Normal item/items
            else {
                keyArray = undefined;
                keyString = undefined;
            }

            // Read item
            struct;//?
            key;//?
            type;//?
            this._read(struct, key, type);
        }
    }

    /**
     * Reading dynamic array. Array length is written before array items.
     * <arrayLength><arrayItem1><arrayItem2>...
     */
    private _readDynamicArray(keyArray: string, key: string, struct: T) {
        if (keyArray.slice(0, -6) !== key) throw SyntaxError(`A key 'aKey' must folow array declaration 'aKey.array'.`);

        // Read array length
        const typeLength = struct[keyArray];
        const arrayLength = this._reader.read(typeLength);

        // Read array items
        const itemsType = struct[key];
        struct[key] = Array(arrayLength).fill(itemsType);
        this._recursion(struct[key]);

        // Delete array length key
        delete struct[keyArray];
    }

    /**
     * Reading dynamic string. String length is written before string.
     * <stringLength><string>
     */
    private _readDynamicString(keyString: string, key: string, struct: T) {
        if (keyString.slice(0, -7) !== key) throw SyntaxError(`A key 'aKey' must follow string declaration 'aKey.string'.`);
        if (struct[key] != 'string') throw SyntaxError(`An object 'aKey' must be type 'string' after string declaration 'aKey.string'.`);

        // Read string length
        const typeLength = struct[keyString];
        const stringLength = this._reader.read(typeLength);

        // Read string
        const stringValue = this._reader.read(`s${stringLength}`);
        struct[key] = stringValue;

        // Delete string length key
        delete struct[keyString];
    }

    _read(struct: T, key: string, type: string) {
        switch (typeof type) {
            case 'object':
                this._recursion(struct[key]);
                break;
            case 'string':
                struct[key] = this._reader.read(type);
                break;
            default:
                throw TypeError(`Unknown type "${type}"`);
        }
    }

    toStruct(): T {
        return this._struct;
    }

    get size() {
        return this._reader.size;
    }

    get offset() {
        return this._reader.offset;
    }
}

export class ReadBE<T> extends Read<T> {
    constructor(model: Model, buffer: Buffer, offset= 0) {
        super();
        this._reader = new ReadBufferBE(buffer, offset);
        this._struct = model as T;
        this._recursion(this._struct);
    }
}

export class ReadLE<T> extends Read<T> {
    constructor(model: Model, buffer: Buffer, offset= 0) {
        super();
        this._reader = new ReadBufferLE(buffer, offset);
        this._struct = model as T;
        this._recursion(this._struct);
    }
}

export class ModelParser {
    static parse(model: Model, types?: Types): string {
        switch (typeof types) {
            case "string":
                types = ModelParser.parse(types);
                types = JSON.parse(types);
            case "object":
                types = Object.entries(types);
                break;
        }

        let json: string = (typeof model === 'string') ? model : JSON.stringify(model); // stringify
        json = json.replace(/\/\/.*$/gm, ``); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\s{2,}/g, ` `); // reduce ' ' to one ' '
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.replace(/\s*,\s*/g, `,`); //x remove spaces before/after ,
        json = json.replace(/\s*([}\]])\s*;?\s*/g, `$1`); // remove ending ; for } or ] and trim ' ' on start and ' '
        json = json.replace(/([{\[])\s*(\w)/g, `$1$2`); // remove spaces after { or [
        json = json.replace(/([}\]])\s*(\w+)/g, `$1,$2`); // add , between keys
        json = json.replace(/([\w0-9])\s*:?\s*([{\[])/g, `$1:$2`); // add missing : between key and { or [ and remove ' ' around :
        json = json.replace(/\s*:\s*/g, ':'); // remove spaces around :
        json = json.replace(/\"/g, ''); // remove all "

        let matches: RegExpMatchArray | [];
        // Special
        // `{Type Key[2]}` => `{Key:[Type,Type]}`, n times
        // `{Type Key[u8]}` => `{Key.array:u8,Key:Type}`
        // `{string Key[2]}` => `{Key:s2}`
        // `{string Key[u8]}` => `{Key.string:u8,Key:string}`
        matches = (json.match(/\w+ \w+:\[\w+\]/g) || []);
        for (let match of matches) {
            const m = match.match(/(\w+) (\w+):\[(\w+)\]/);
            if (m !== null && m.length === 4) {
                // TODO improve this
                let [, t, k, n] = m;
                n = +n || n;
                let nan = +Number.isNaN(+n);
                let r = t === "string"
                    ? [`${k}:s${n}`, `${k}.string:${n},${k}:${t}`][nan]
                    : [`${k}:[${Array(n).fill(t)}]`, `${k}.array:${n},${k}:${t}`][nan];
                json = json.split(match).join(r);
            }
        }

        // Special
        // `u8 [3];` => `["u8","u8","u8"]`
        // `string [3];` => `s3`
        matches = (json.match(/\w+:\[\w+\]/g) || []);
        for (let match of matches) {
            const m = match.match(/(\w+):\[(\w+)\]/);
            if (m !== null && m.length === 3) {
                // TODO improve this
                let [, t, n] = m;
                n = +n || n;
                let nan = +Number.isNaN(+n);
                if (nan === 1) throw Error(`Syntax error '${match}'`);
                let r = t === "string"
                    ? `s${n}`
                    : `[${Array(n).fill(t)}]`;
                json = json.split(match).join(r);
            }
        }

        // Special: a[u8/u8],a[3/u8],a[u8/string],a[3/string]
        // A) array, <k>:[<n>/<t>], k-key, n-size, t-type
        // A1 <k>:[<t>, ...], when <n> is number
        // A2 <k>.array:<s>,<k>:<t>, when <n> is string (u8, ect)
        // S) string, <k>:[<s>/string], k-key, n-size, string
        // S1 <k>:s<n>, when <n> is number
        // S2 <k>.string:u8,<k>:string, when <n> is string (u8, ect)
        matches = (json.match(/\w+:\[\w+\/\w+=?\w*\]/g) || []);
        for (let match of matches) {
            const m = match.match(/(\w+):\[(\w+)\/(\w+)\]/);
            if (m !== null && m.length === 4) {
                // TODO improve this
                let [, k, n, t] = m;
                n = +n || n;
                let nan = +Number.isNaN(+n);
                let r = t === "string"
                    ? [`${k}:s${n}`, `${k}.string:${n},${k}:${t}`][nan]
                    : [`${k}:[${Array(n).fill(t)}]`, `${k}.array:${n},${k}:${t}`][nan];
                json = json.split(match).join(r);
            }
        }

        // [<n>/<t>], n-size, t-type
        // [<t>, ...]
        matches = (json.match(/\[\w+\/\w+=?\w*\]/g) || []);
        for (let match of matches) {
            const m = match.match(/\[(\w+)\/(\w+)\]/);
            if (m !== null && m.length === 3) {
                // TODO improve this
                let [, n, t] = m;
                n = +n || -1;
                if (n >= 0) {
                    let r = `[${Array(n).fill(t)}]`;
                    json = json.split(match).join(r);
                } else {
                    throw Error("Syntax error");
                }
            }
        }


        // `{<t> <v1>,<v2>,...}`
        // `{<v1>:<t>,<v2>:<t>,...}`
        matches = (json.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) || []);
        for (let match of matches) {
            const m = match.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
            if (m !== null && m.length === 3) {
                // TODO improve this
                let [, t, r] = m;
                r = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
                json = json.split(match).join(r);
            }
        }

        // `<t> <v1>,<v2>,...`
        // `{<v1>:<t>,<v2>:<t>,...}`
        matches = (json.match(/([_a-zA-Z]\w*)\s+([\w0-9,]+);/g) || []);
        for (let match of matches) {
            const m = match.match(/([_a-zA-Z]\w*)\s*(.*);/);
            if (m !== null && m.length === 3) {
                // TODO improve this
                let [, t, r] = m;
                r = `${r.split(/\s*,\s*/).map(k => `${k}:${t},`).join('')}`;
                json = json.split(match).join(r);
            }
        }
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','

        json = json.replace(/([}\]])\s*([{\[\w])/g, '$1,$2'); // add missing ',' between }] and {[

        json = json.replace(/([_a-zA-Z]\w*\.?\w*)/g, '"$1"'); // Add missing ""

        // Replace model types with user types
        if (Array.isArray(types)) {
            // replace model with user types, stage 1
            types.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
            // reverse user types to replace nested user types
            types.reverse();
            // replace model with reverse user types, stage 2
            types.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
        }

        try {
            json = JSON.parse(json);
            return JSON.stringify(json); // return fixed json
        } catch (error) {
            throw Error(`Syntax error '${json}'`);
        }
    }
}

export class CStruct<T> {
    _jsonModel: string;

    constructor(model: Model, types?: Types) {
        this._jsonModel = ModelParser.parse(model, types);
    }

    get jsonModel(): string {
        return this._jsonModel;
    }

    get modelClone(): Model {
        return JSON.parse(this._jsonModel) as Model;
    }

    read(buffer: Buffer, offset= 0) {
        throw Error("This is abstract class");
    }

    write(buffer: Buffer, struct: T, offset= 0) {
        throw Error("This is abstract class");
    }

    make(struct: T) {
        throw Error("This is abstract class");
    }
}

export class CStructBE<T> extends CStruct<T> {
    constructor(model: Model, types?: Types) {
        super(model, types);
    }

    read(buffer: Buffer, offset= 0): CStructReadResult<T> {
        const reader = new ReadBE<T>(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct(),
            offset: reader.offset,
            size: reader.size,
        };
    }

    write(buffer: Buffer, struct: T, offset= 0): CStructWriteResult {
        const writer = new WriteBE<T>(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        }
    }

    make(struct: T): CStructWriteResult {
        const writer = new MakeBE<T>(this.modelClone, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        }
    }
}

export class CStructLE<T> extends CStruct<T> {
    constructor(model: Model, types?: Types) {
        super(model, types);
    }

    read(buffer: Buffer, offset= 0): CStructReadResult<T> {
        const reader = new ReadLE<T>(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct() as T,
            offset: reader.offset,
            size: reader.size,
        };
    }

    write(buffer: Buffer, struct: T, offset= 0): CStructWriteResult {
        const writer = new WriteLE<T>(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        }
    }

    make(struct: T): CStructWriteResult {
        const writer = new MakeLE<T>(this.modelClone, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        }
    }
}

// TESTS

let model;
let a;
let b;
let s;
let bfr;
let m;
let c;
let cstruct;

// model = {'ab.array': 'u8', ab: 'u16',};
// b = new MakeLE<{}>(
//     model, {
//     'ab': [1, 2, 3, 4],
// });
// b.toBuffer();//?
// b.toBuffer().toString('utf8');//?
// b.toBuffer().toString('hex');//?
// s = new ReadLE(model, b.toBuffer());
// s.toObject();//?
//
// model = {'ab.array': 'u8', ab: 'u16',};
// b = new MakeBE<{}>(
//     model, {
//     'ab': [1, 2, 3, 4],
// });
// b.toBuffer();//?
// b.toBuffer().toString('utf8');//?
// b.toBuffer().toString('hex');//?
// s = new ReadBE(model, b.toBuffer());
// s.toObject();//?

// b = new MakeLE<{}>({
//     'st.string': 'u8',
//     st: 'string',
// }, {
//     'st': 'ABCDE',
// });
// b.toBuffer();//?
// b.toBuffer().toString('utf8');//?
// b.toBuffer().toString('hex');//?
// s = new ReadLE<{}>({
//     'st.string': 'u8',
//     st: 'string',
// }, b.toBuffer());
// s.toObject();//?


// b = new MakeLE<{}>({
//     'ab.array': 'u8',
//     ab: 's3',
// }, {
//     'ab': ["abc", "def", "ghi"],
// });
// b.toBuffer();//?
// b.toBuffer().toString('utf8');//?
// b.toBuffer().toString('hex');//?
// s = new ReadLE({
//     'ab.array': 'u8',
//     ab: 's3',
// }, b.toBuffer());
// s.toObject();//?


// b = new MakeLE<{}>({
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
// }, {
//     message: "abc",
//     code: 0xAA,
//     num: 0x1234,
// });
// b.toBuffer();//?
// b.toBuffer().toString('hex');//?
// s = new ReadLE({
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
// }, b.toBuffer());
// s.toObject();//?
//
//
// b = new MakeBE<{}>({
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
// }, {
//     message: "abc",
//     code: 0xAA,
//     num: 0x1234,
// });
// b.toBuffer();//?
// b.toBuffer().toString('hex');//?
// s = new ReadBE({
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
// }, b.toBuffer());
// s.toObject();//?

// model = {
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
// };
// bfr = Buffer.alloc(10);
// b = new WriteLE<{}>(
//     model,
//     {
//         message: "abc",
//         code: 0xAA,
//         num: 0x1234,
//     },
//     bfr,
//     2);
// b.toBuffer();//?
// b.toBuffer().toString('hex');//?
// b.getBufferAndOffset();//?
// b.offset;//?
// s = new ReadLE(model, b.toBuffer(), 2);
// s.toStruct();//?
// s.size;//?
// s.offset;//?


// model = {
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
// };
// m = ModelParser.parse(model);
// m;//?
//
// m = ModelParser.parse(`{abc:u8,def:u16}`);
// m;//?
// m = ModelParser.parse(`{u8 abc; u16 def;}`);
// m;//?

model = {
    static: 's3',
    code: 'u8',
    num: 'u16',
    "dynamic.string": "u8",
    "dynamic": "string",
};
s = {
    static: "abc",
    code: 0xAA,
    num: 0x1234,
    dynamic: "cba",
};
bfr = Buffer.alloc(13);
const structA = new CStructLE<A>(
    model,
);
c = structA.write(bfr, s, 2,);
c;//?
c.buffer.toString('utf8');//?
c.buffer.toString('hex');//?

c = structA.read(c.buffer, 2);
c;//?
c.struct;//?
c.size;//?
c.offset;//?

class A {
    constructor(
        public message: string,
        public code: number,
        public num: number,
    ) {
    }
}

// model = {
//     message: 's3',
//     code: 'u8',
//     num: 'u16',
//     // "dynamic.string": "u8",
//     // "dynamic": "string",
// };
// a = new A(
//     "abc",
//     0xAA,
//     0x1234,
// );
// bfr = Buffer.alloc(10);
// const structA = new CStructLE<A>(
//     model,
// );
// c = structA.write(bfr, a, 2,);
// c;//?
// c.buffer.toString('utf8');//?
// c.buffer.toString('hex');//?
//
// c = structA.read(c.buffer, 2);
// c;//?
// c.struct;//?
// c.size;//?
// c.offset;//?

a;
c = structA.make(a);
c;//?
c.buffer.toString('utf8');//?
c.buffer.toString('hex');//?
c.offset;//?
c.size;//?

c = structA.read(c.buffer);
c;//?
c.struct;//?
c.size;//?
c.offset;//?