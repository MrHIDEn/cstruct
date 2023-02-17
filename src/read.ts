import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";

export class Read<T> {
    _struct: T;
    _reader: ReadBufferLE | ReadBufferBE;

    _recursion(struct: T) {
        const entries = Object.entries(struct);
        let keyArray;
        let keyString;

        for (const [key, type] of entries) {
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