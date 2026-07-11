import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { Model, SpecialType, StructValue, Type } from "./types";
import { ReadWriteBase } from "./read-write-base";


export class Read<T> extends ReadWriteBase {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;

    readSchema(model: Model): StructValue {
        if (Array.isArray(model)) {
            const result: StructValue[] = [];
            for (let i = 0; i < model.length; i++) {
                result[i] = this.readField(model[i]);
            }
            return result;
        }

        const result: Record<string, StructValue> = {};
        for (const [modelKey, modelType] of Object.entries(model)) {
            const keyDynamicGroups = this.getDynamicTypeLengthGroupsMatch(modelKey);

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

            if (typeof modelType === 'string') {
                const typeDynamicGroups = this.getDynamicTypeLengthGroupsMatch(modelType);

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

        const size = isStatic
            ? staticSize
            : this._reader.read(dynamicLength) as number;

        if (size === 0 && specialType === SpecialType.Buffer) {
            throw new Error(`Buffer size can not be 0.`);
        }

        if (specialType) {
            const value = this._reader.read(readType, size);
            return specialType === SpecialType.Json ? JSON.parse(value as string) : value;
        }

        return this.readArrayValue(readType, size);
    }

    private readField(modelType: Type): StructValue {
        if (Array.isArray(modelType)) {
            return this.readSchema(modelType);
        }

        if (typeof modelType === 'string') {
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

            if (modelType === 'buf0') {
                throw new Error(`Buffer size can not be 0. (read)`);
            }
            let structValues = this._reader.read(modelType);
            if (modelType === 'j0') {
                structValues = JSON.parse(structValues as string);
            }
            return structValues;
        }

        if (typeof modelType === 'object') {
            return this.readSchema(modelType as Model);
        }

        throw TypeError(`Unknown type "${modelType}"`);
    }

    private readArrayValue(itemsType: Type, size: number): StructValue {
        switch (typeof itemsType) {
            case 'object': {
                const result: StructValue[] = [];
                for (let i = 0; i < size; i++) {
                    result[i] = this.readSchema(itemsType as Model);
                }
                return result;
            }
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
