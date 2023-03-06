import { Model, StructEntry, Type, WriterValue } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
import { ReadWriteBase } from "./read-write-base";

export class Make<T> extends ReadWriteBase {
    protected _writer: WriteBufferLE | WriteBufferBE;

    _recursion(model: Model, struct: T) {
        const entries: StructEntry[] = Object.entries(model);

        for (const [modelKey, modelType] of entries) {
            // Catch dynamic key
            const keyDynamicGroups = this._dynamicGroupsMatch(modelKey);

            // Dynamic key
            if (keyDynamicGroups) {
                const {dynamicKey, dynamicLength} = keyDynamicGroups;
                this._writeDynamicKey(struct, modelKey, modelType, dynamicKey, dynamicLength);
                continue;
            }

            // Dynamic type
            if (typeof modelType === 'string') {
                // Catch dynamic type
                const typeDynamicGroups = this._dynamicGroupsMatch(modelType);

                if (typeDynamicGroups) {
                    const {dynamicKey: dynamicType, dynamicLength} = typeDynamicGroups;
                    this._writeDynamicType(struct, modelKey, modelType, dynamicType, dynamicLength);
                    continue;
                }
            }

            // Static item
            this._write(model, struct, modelKey, modelType);
        }
    }

    private _writeDynamicKey(struct: T, modelKey: string, modelType: Type, dynamicKey: string, dynamicLength: string) {
        // (some.i16: u8)
        // modelKey: some.i16, itemsType: u8, dynamicKey: some, dynamicLength: i16
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(modelType);
        const structValues = struct[dynamicKey];
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (some.2: u8)
            // modelKey: some.2, modelType: u8, dynamicKey: some, dynamicLength: 2

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(`${modelType}${staticSize}`, structValues);
            }
            // Write array of modelType
            else {
                if (structValues.length !== staticSize) {
                    throw new Error(`Expected ${staticSize} items, got ${structValues.length}`);
                }
                this._writeArray(modelType, structValues);
            }
        }
        // Dynamic size
        else {
            // (some.i16: u8)
            // modelKey: some.i16, modelType: u8, dynamicKey: some, dynamicLength: i16
            const size = structValues.length;

            // Write size
            this._writer.write(dynamicLength, size);

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(modelType as string, structValues);
            }
            // Write array of modelType
            else {
                this._writeArray(modelType, structValues);
            }
        }
    }

    private _writeDynamicType(struct: T, modelKey: string, modelType: Type, dynamicType: string, dynamicLength: string) {
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(modelType);
        const structValues = struct[modelKey];
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (i8.3)
            // modelKey: "0", modelType: i8.3, dynamicKey: i8, dynamicLength: 3

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(dynamicType, structValues);
            }
            // Write array of dynamicType
            else {
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
            const size = structValues.length;

            // Write size
            this._writer.write(dynamicLength, size);

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
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

    toAtoms(): string[] {
        return this._writer.toAtoms();
    }
}