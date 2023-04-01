import { Model, SpecialType, StructEntry, Type, WriterValue } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
import { ReadWriteBase } from "./read-write-base";

export class Make<T> extends ReadWriteBase {
    protected _writer: WriteBufferLE | WriteBufferBE;

    _recursion(model: Model, struct: T) {
        const entries: StructEntry[] = Object.entries(model);

        for (const [modelKey, modelType] of entries) {
            // Catch key.length
            const keyLengthGroups = this._getTypeLengthGroupsMatch(modelKey);

            // Dynamic key
            if (keyLengthGroups) {
                const {dynamicType, dynamicLength} = keyLengthGroups;
                this._writeDynamicKey(struct, modelKey, modelType, dynamicType, dynamicLength);
                continue;
            }

            // Dynamic type
            if (typeof modelType === 'string') {
                // Catch dynamic type
                const typeDynamicGroups = this._getTypeLengthGroupsMatch(modelType);

                if (typeDynamicGroups) {
                    const {dynamicType, dynamicLength} = typeDynamicGroups;
                    this._writeDynamicType(struct, modelKey, modelType, dynamicType, dynamicLength);
                    continue;
                }
            }

            // Static item
            this._write(model, struct, modelKey, modelType);
        }
    }

    private _writeDynamicKey(struct: T, modelKey: string, modelType: Type, dynamicType: string, dynamicLength: string) {
        // 1 struct, modelKey: some.i16, modelType: u8, dynamicType: some, dynamicLength: i16
        // 2 struct, modelKey: some.5  , modelType: u8, dynamicType: some, dynamicLength: 5
        // 1 (some.i16: u8) (<dynamicType>.<dynamicLength>: <modelType>)
        // 2 (some.5  : u8) (<dynamicType>.<dynamicLength>: <modelType>)
        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);
        let structValues = struct[dynamicType];

        // Static size
        if (isStatic) {
            // (some.5: u8)
            // modelKey: some.5, modelType: u8, dynamicType: some, dynamicLength: 5
            switch (specialType) {
                // Write json
                case SpecialType.Json:
                    structValues = JSON.stringify(structValues);

                // Write string or buffer
                case SpecialType.String: // eslint-disable-line no-fallthrough
                case SpecialType.Buffer:
                    this._writer.write(`${modelType}${staticSize}`, structValues);
                    break;

                // Write array of modelType
                default:
                    if (structValues.length !== staticSize) {
                        throw new Error(`Expected ${staticSize} items, got ${structValues.length}`);
                    }
                    this._writeArray(modelType, structValues);
                    break;
            }
        }
        // Dynamic size
        else {
            // (some.i16: u8)
            // modelKey: some.i16, modelType: u8, dynamicType: some, dynamicLength: i16

            if (specialType === SpecialType.Json) {
                structValues = JSON.stringify(structValues);
            }

            // Write size
            this._writer.write(dynamicLength, structValues.length);

            // Write string or buffer or json
            if (specialType) {
                this._writer.write(modelType as string, structValues);
            }

            // Write array of modelType
            else {
                this._writeArray(modelType, structValues);
            }
        }
    }

    private _writeDynamicType(struct: T, modelKey: string, modelType: Type, dynamicType: string, dynamicLength: string) {
        // 1 struct, modelKey: "0", modelType: u8.i16, dynamicType: u8, dynamicLength: i16
        // 2 struct, modelKey: "0", modelType: u8.5  , dynamicType: u8, dynamicLength: 5
        // 1 (u8.i16) (<dynamicType>.<dynamicLength>)
        // 2 (u8.5)   (<dynamicType>.<dynamicLength>)
        const {
            specialType,
            isStatic,
            staticSize
        } = this.extractTypeAndSize(modelType, dynamicLength);
        let structValues = struct[modelKey];

        // Static size
        if (isStatic) {
            // (i8.3)
            // modelKey: "0", modelType: i8.3, dynamicKey: i8, dynamicLength: 3
            switch (specialType) {
                // Write json
                case SpecialType.Json:
                    structValues = JSON.stringify(structValues);

                // Write string or buffer
                case SpecialType.String: // eslint-disable-line no-fallthrough
                case SpecialType.Buffer:
                    this._writer.write(dynamicType, structValues);
                    break;

                // Write array of dynamicType
                default:
                    if (structValues.length !== staticSize) {
                        throw new Error(`Expected ${staticSize} items, got ${structValues.length}`);
                    }
                    this._writeArray(dynamicType, structValues);

            }
        }
        // Dynamic size
        else {
            // (i8.i16)
            // modelKey: "0", modelType: i8.i16, dynamicKey: i8, dynamicLength: i16
            if (specialType === SpecialType.Json) {
                structValues = JSON.stringify(structValues);
            }

            // Write size
            this._writer.write(dynamicLength, structValues.length);

            // Write string or buffer or json
            if (specialType) {
                this._writer.write(dynamicType as string, structValues);
            }

            // Write array of dynamicType
            else {
                this._writeArray(dynamicType, structValues);
            }
        }
    }

    private _write(model: Model, struct: T, modelKey: string, modelType: Type) {
        switch (typeof modelType) {
            case 'object':
                this._recursion(model[modelKey], struct[modelKey]);
                break;
            case 'string':
                this._writer.write(modelType, struct[modelKey]);
                break;
            default:
                throw TypeError(`Unknown type "${modelType}"`);
        }
    }

    private _writeArray(itemsType: Type, structValues: T[]) {
        switch (typeof itemsType) {
            case 'object':
                for (const structValue of structValues) {
                    this._recursion(itemsType, structValue);
                }
                break;
            case 'string':
                for (const structValue of structValues) {
                    this._writer.write(itemsType, structValue as WriterValue);
                }
                break;
            default:
                throw TypeError(`Unknown type "${itemsType}"`);
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