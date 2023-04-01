import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { SpecialType, StructEntry, Type } from "./types";
import { ReadWriteBase } from "./read-write-base";


export class Read<T> extends ReadWriteBase {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;

    _recursion(struct: T) {
        const entries: StructEntry[] = Object.entries(struct);

        for (const [modelKey, modelType] of entries) {
            // Catch dynamic key
            const keyDynamicGroups = this._getTypeLengthGroupsMatch(modelKey);

            // Dynamic key
            if (keyDynamicGroups) {
                delete struct[modelKey];
                const {dynamicType, dynamicLength} = keyDynamicGroups;
                this._readDynamicKey(struct, modelKey, modelType, dynamicType, dynamicLength);
                continue;
            }

            // Dynamic type
            if (typeof modelType === 'string') {
                // Catch dynamic type
                const typeDynamicGroups = this._getTypeLengthGroupsMatch(modelType);

                if (typeDynamicGroups) {
                    const {dynamicType, dynamicLength} = typeDynamicGroups;
                    this._readDynamicType(struct, modelKey, modelType, dynamicType, dynamicLength);
                    continue;
                }
            }

            // Static item
            this._read(struct, modelKey, modelType);
        }
    }

    private _readDynamicKey(struct: T, modelKey: string, modelType: Type, dynamicType: string, dynamicLength: string) {
        // 1 modelKey: some.i16, modelType: u8, dynamicType: some, dynamicLength: i16
        // 2 modelKey: some.5  , modelType: u8, dynamicType: some, dynamicLength: 5
        // 1 (some.i16: u8)
        // 2 (some.5  : u8)

        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);

        // Size, get or read
        const size = isStatic
            ? staticSize
            : this._reader.read(dynamicLength) as number;

        // Read string or buffer or json
        if (specialType) {
            const value = this._reader.read(`${modelType}${size}`);
            struct[dynamicType] = specialType === SpecialType.Json ? JSON.parse(value as string) : value;
        }

        // Read array of modelType
        else {
            this._readArray(modelType, struct, dynamicType, size);
        }
    }

    private _readDynamicType(struct: T, modelKey: string, modelType: Type, dynamicType: string, dynamicLength: string) {
        // 1 struct, modelKey: "0", modelType: u8.i16, dynamicType: u8, dynamicLength: i16
        // 2 struct, modelKey: "0", modelType: u8.5  , dynamicType: u8, dynamicLength: 5
        // 1 (u8.i16) (<dynamicType>.<dynamicLength>)
        // 2 (u8.5)   (<dynamicType>.<dynamicLength>)

        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);

        // Size, get or read
        const size = isStatic
            ? staticSize
            : this._reader.read(dynamicLength) as number;

        // Read string or buffer or json
        if (specialType) {
            const value = this._reader.read(`${dynamicType}${size}`);
            struct[modelKey] = specialType === SpecialType.Json ? JSON.parse(value as string) : value;
        }

        // Read array of itemsType
        else {
            this._readArray(dynamicType, struct, modelKey, size);
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
}