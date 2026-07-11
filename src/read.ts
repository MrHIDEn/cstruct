import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { Model, SpecialType, StructValue, Type } from "./types";
import { ReadWriteBase } from "./read-write-base";


export class Read<T> extends ReadWriteBase {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;

    /**
     * Walk the compiled model and build a fresh struct value.
     * The model is never mutated — the result is a new object/array tree.
     */
    readSchema(model: Model): StructValue {
        // Tuple model: [{ u8 }, { u16 }] → [value0, value1, ...]
        if (Array.isArray(model)) {
            const result: StructValue[] = [];
            for (let i = 0; i < model.length; i++) {
                result[i] = this.readField(model[i]);
            }
            return result;
        }

        const result: Record<string, StructValue> = {};
        for (const [modelKey, modelType] of Object.entries(model)) {
            // Catch dynamic key — e.g. "some.i16" or "some.5"
            const keyDynamicGroups = this.getDynamicTypeLengthGroupsMatch(modelKey);

            // Dynamic key: field name carries type/length, value is the item type
            // 1 (some.i16: u8)
            // 2 (some.5  : u8)
            if (keyDynamicGroups) {
                const { dynamicType, dynamicLength } = keyDynamicGroups;
                result[dynamicType] = this.readDynamicOrStaticValue(
                    modelType as string,
                    dynamicType,
                    dynamicLength,
                    modelType as string,
                );
                continue;
            }

            // Dynamic type: type string carries length, key is the struct field name
            if (typeof modelType === 'string') {
                // Catch dynamic type — e.g. "u8.i16" or "u8.5"
                const typeDynamicGroups = this.getDynamicTypeLengthGroupsMatch(modelType);

                // Dynamic type
                // 1 (u8.i16) (<dynamicType>.<dynamicLength>)
                // 2 (u8.5)   (<dynamicType>.<dynamicLength>)
                if (typeDynamicGroups) {
                    const { dynamicType, dynamicLength } = typeDynamicGroups;
                    result[modelKey] = this.readDynamicOrStaticValue(
                        dynamicType,
                        dynamicType,
                        dynamicLength,
                        dynamicType,
                    );
                    continue;
                }
            }

            // Static field — scalar, nested struct, or fixed tuple
            result[modelKey] = this.readField(modelType);
        }
        return result;
    }

    private readDynamicOrStaticValue(
        modelType: string,
        dynamicType: string,
        dynamicLength: string,
        readType: string,
    ): StructValue {
        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);

        // Size: use static length from the model, or read it from the buffer first
        const size = isStatic
            ? staticSize
            : this._reader.read(dynamicLength) as number;

        if (size === 0 && specialType === SpecialType.Buffer) {
            throw new Error(`Buffer size can not be 0.`);
        }

        // Read string, wstring, buffer, or json blob
        if (specialType) {
            const value = this._reader.read(readType, size);
            return specialType === SpecialType.Json ? JSON.parse(value as string) : value;
        }

        // Read array of itemsType (size elements)
        return this.readArrayValue(readType, size);
    }

    private readField(modelType: Type): StructValue {
        // Tuple element or nested array model
        if (Array.isArray(modelType)) {
            return this.readSchema(modelType);
        }

        if (typeof modelType === 'string') {
            // Dynamic type inside a tuple — e.g. "j.0" or "s.0"
            const typeDynamicGroups = this.getDynamicTypeLengthGroupsMatch(modelType);
            if (typeDynamicGroups) {
                const { dynamicType, dynamicLength } = typeDynamicGroups;
                return this.readDynamicOrStaticValue(
                    dynamicType,
                    dynamicType,
                    dynamicLength,
                    dynamicType,
                );
            }

            // Static scalar — u8, i16, j0, buf, wstring, ...
            if (modelType === 'buf0') {
                throw new Error(`Buffer size can not be 0. (read)`);
            }
            let structValues = this._reader.read(modelType);
            if (modelType === 'j0') {
                structValues = JSON.parse(structValues as string);
            }
            return structValues;
        }

        // Nested struct object
        if (typeof modelType === 'object') {
            return this.readSchema(modelType as Model);
        }

        throw TypeError(`Unknown type "${modelType}"`);
    }

    private readArrayValue(itemsType: Type, size: number): StructValue {
        switch (typeof itemsType) {
            // Array of nested structs — each element gets its own sub-tree
            case 'object': {
                const result: StructValue[] = [];
                for (let i = 0; i < size; i++) {
                    result[i] = this.readSchema(itemsType as Model);
                }
                return result;
            }
            // Array of scalars — repeat the same type string size times
            case 'string': {
                const result: StructValue[] = [];
                for (let i = 0; i < size; i++) {
                    result[i] = this.readField(itemsType);
                }
                return result;
            }
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
