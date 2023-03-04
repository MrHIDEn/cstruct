import { Model, StructEntry, Type, WriterValue } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
import { ReadWriteBase } from "./read-write-base";

export class Make<T> extends ReadWriteBase {
    protected _writer: WriteBufferLE | WriteBufferBE;

    _recursion(model: Model, struct: T) {
        const entries: StructEntry[] = Object.entries(model);

        for (const [key, type] of entries) {
            // Catch dynamic key
            const keyDynamicGroups = this._dynamicGroupsMatch(key);

            // Dynamic key
            if (keyDynamicGroups) {
                const {dynamicKey, dynamicLength} = keyDynamicGroups;
                this._writeDynamicKey(key, type, struct, dynamicKey, dynamicLength);
                continue;
            }

            // Dynamic type
            if (typeof type === 'string') {
                // Catch dynamic type
                const typeDynamicGroups = this._dynamicGroupsMatch(type);

                if (typeDynamicGroups) {
                    const {dynamicKey: dynamicType, dynamicLength} = typeDynamicGroups;
                    this._writeDynamicType(key, type, struct, dynamicType, dynamicLength);
                    continue;
                }
            }

            // Static item
            this._write(model, struct, key, type);
        }
    }

    private _writeDynamicKey(key: string, itemsType: Type, struct: T, dynamicKey: string, dynamicLength: string) {
        // (some.i16: u8)
        // key: some.i16, itemsType: u8, dynamicKey: some, dynamicLength: i16
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(itemsType);
        const structValues = struct[dynamicKey];
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (some.2: u8)
            // key: some.2, itemsType: u8, dynamicKey: some, dynamicLength: 2

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(`${itemsType}${staticSize}`, structValues);
            }
            // Write array of itemsType
            else {
                if (structValues.length !== staticSize) {
                    throw new Error(`Expected ${staticSize} items, got ${structValues.length}`);
                }
                this._writeArray(itemsType, structValues);
            }
        }
        // Dynamic size
        else {
            // (some.i16: u8)
            // key: some.i16, itemsType: u8, dynamicKey: some, dynamicLength: i16
            const size = structValues.length;

            // Write size
            this._writer.write(dynamicLength, size);

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(itemsType as string, structValues);
            }
            // Write array of itemsType
            else {
                this._writeArray(itemsType, structValues);
            }
        }
    }

    private _writeDynamicType(key: string, itemsType: Type, struct: T, dynamicType: string, dynamicLength: string) {
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(itemsType);
        const structValues = struct[key];
        const {isNumber, staticSize} = this._getSize(dynamicLength);

        // Static size
        if (isNumber) {
            // (i8.3)
            // key: "0", itemsType: i8.3, dynamicKey: i8, dynamicLength: 3

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(dynamicType, structValues);
            }
            // Write array of itemsType
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
            // key: "0", itemsType: i8.i16, dynamicKey: i8, dynamicLength: i16
            const size = structValues.length;

            // Write size
            this._writer.write(dynamicLength, size);

            // Write string or buffer
            if (itemTypeIsStringOrBuffer) {
                this._writer.write(dynamicType as string, structValues);
            }
            // Write array of itemsType
            else {
                this._writeArray(dynamicType, structValues);
            }
        }
    }

    private _write(model: Model, struct: T, key: string, type: Type) {
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

    private _writeArray(itemsType: Type, structValues: T[]) {
        switch (typeof itemsType) {
            case 'object':
                for (const structItem of structValues) {
                    this._recursion(itemsType, structItem);
                }
                break;
            case 'string':
                for (const itemValue of structValues) {
                    this._writer.write(itemsType, itemValue as WriterValue);
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