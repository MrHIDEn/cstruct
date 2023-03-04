import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { StructEntry, Type } from "./types";
import { ReadWriteBase } from "./read-write-base";


export class Read<T> extends ReadWriteBase {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;

    _recursion(struct: T) {
        const entries: StructEntry[] = Object.entries(struct);

        for (const [key, type] of entries) {
            // Catch dynamic key
            const keyDynamicGroups = this._dynamicGroupsMatch(key);

            // Dynamic key
            if (keyDynamicGroups) {
                const {dynamicKey, dynamicLength} = keyDynamicGroups;
                this._readDynamicKey(key, type, struct, dynamicKey, dynamicLength);
                continue;
            }

            // Dynamic type
            if (typeof type === 'string') {
                // Catch dynamic type
                const typeDynamicGroups = this._dynamicGroupsMatch(type);

                if (typeDynamicGroups) {
                    const {dynamicKey: dynamicType, dynamicLength} = typeDynamicGroups;
                    this._readDynamicType(key, type, struct, dynamicType, dynamicLength);
                    continue;
                }
            }

            // Static item
            this._read(struct, key, type);
        }
    }

    private _readDynamicKey(key: string, itemsType: Type, struct: T, dynamicKey: string, dynamicLength: string) {
        // (some.i32: u8)
        // key: some.i32, itemsType: u8, dynamicKey: some, dynamicLength: i32
        // => delete some.i32, use (some: [u8, ...*i32] or some: s<*i32>)
        delete struct[key];
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(itemsType);
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (some.2: u8)
            // key: some.2, itemsType: u8, dynamicKey: some, dynamicLength: 2

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[dynamicKey] = this._reader.read(`${itemsType}${staticSize}`);
            }
            // Read array of itemsType
            else {
                this._readArray(itemsType, struct, dynamicKey, staticSize);
            }
        }
        // Dynamic size
        else {
            // Read size
            const size = this._reader.read(dynamicLength) as number;

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[dynamicKey] = this._reader.read(`${itemsType}${size}`);
            }
            // Read array of itemsType
            else {
                this._readArray(itemsType, struct, dynamicKey, size);
            }
        }
    }

    private _readDynamicType(key: string, itemsType: Type, struct: T, dynamicType: string, dynamicLength: string) {
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(itemsType);
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (u8.3)
            // key: "0", itemsType: i8.3, dynamicKey: i8, dynamicLength: 3

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[key] = this._reader.read(`${dynamicType}${staticSize}`);
            }
            // Read array of itemsType
            else {
                this._readArray(dynamicType, struct, key, staticSize);
            }
        }
        // Dynamic size
        else {
            // (i8.i16)
            // key: "0", itemsType: i8.i16, dynamicKey: i8, dynamicLength: i16
            // => delete some.i32, use (some: [u8, ...*i32] or some: s<*i32>)

            // Read size
            const size = this._reader.read(dynamicLength) as number;

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[key] = this._reader.read(`${dynamicType}${size}`);
            }
            // Read array of itemsType
            else {
                this._readArray(dynamicType, struct, key, size);
            }
        }
    }

    private _read(struct: T, key: string, type: Type) {
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

    private _readArray(itemsType: Type, struct: T, dynamicKey: string, size: number) {
        switch (typeof itemsType) {
            case 'object': {
                const json = JSON.stringify(itemsType);
                struct[dynamicKey] = Array(size).fill(0).map(() => JSON.parse(json));
                this._recursion(struct[dynamicKey]);
                break;
            }
            case 'string':
                struct[dynamicKey] = Array(size).fill(itemsType);
                this._recursion(struct[dynamicKey]);
                break;
            default:
                throw TypeError(`Unknown type "${itemsType}"`);
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

    toAtoms(): string[] {
        return this._reader.toAtoms();
    }
}