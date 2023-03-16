import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { StructEntry, Type } from "./types";
import { ReadWriteBase } from "./read-write-base";


export class Read<T> extends ReadWriteBase {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;

    _recursion(struct: T) {
        const entries: StructEntry[] = Object.entries(struct);

        for (const [modelKey, modelType] of entries) {
            // Catch dynamic key
            const keyDynamicGroups = this._dynamicGroupsMatch(modelKey);

            // Dynamic key
            if (keyDynamicGroups) {
                const {dynamicKey, dynamicLength} = keyDynamicGroups;
                this._readDynamicKey(struct, modelKey, modelType, dynamicKey, dynamicLength);
                continue;
            }

            // Dynamic type
            if (typeof modelType === 'string') {
                // Catch dynamic type
                const typeDynamicGroups = this._dynamicGroupsMatch(modelType);

                if (typeDynamicGroups) {
                    const {dynamicKey: dynamicType, dynamicLength} = typeDynamicGroups;
                    this._readDynamicType(struct, modelKey, modelType, dynamicType, dynamicLength);
                    continue;
                }
            }

            // Static item
            this._read(struct, modelKey, modelType);
        }
    }

    private _readDynamicKey(struct: T, modelKey: string, modelType: Type, dynamicKey: string, dynamicLength: string) {
        // (some.i32: u8)
        // modelKey: some.i32, modelType: u8, dynamicKey: some, dynamicLength: i32
        // => delete some.i32, use (some: [u8, ...*i32] or some: s<*i32>)
        delete struct[modelKey];
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(modelType);
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (some.2: u8)
            // modelKey: some.2, modelType: u8, dynamicKey: some, dynamicLength: 2

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[dynamicKey] = this._reader.read(`${modelType}${staticSize}`);
            }
            // Read array of modelType
            else {
                this._readArray(modelType, struct, dynamicKey, staticSize);
            }
        }
        // Dynamic size
        else {
            // Read size
            const size = this._reader.read(dynamicLength) as number;

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[dynamicKey] = this._reader.read(`${modelType}${size}`);
            }
            // Read array of modelType
            else {
                this._readArray(modelType, struct, dynamicKey, size);
            }
        }
    }

    private _readDynamicType(struct: T, modelKey: string, modelType: Type, dynamicType: string, dynamicLength: string) {
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(modelType);
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (u8.3)
            // modelKey: "0", modelType: i8.3, dynamicKey: i8, dynamicLength: 3

            // Read string or buffer
            if (itemTypeIsStringOrBuffer) {
                struct[modelKey] = this._reader.read(`${dynamicType}${staticSize}`);
            }
            // Read array of dynamicType
            else {
                this._readArray(dynamicType, struct, modelKey, staticSize);
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
                struct[modelKey] = this._reader.read(`${dynamicType}${size}`);
            }
            // Read array of itemsType
            else {
                this._readArray(dynamicType, struct, modelKey, size);
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