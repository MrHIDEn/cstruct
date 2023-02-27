import { Model, Types } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";

export class Make<T> {
    protected _writer: WriteBufferLE | WriteBufferBE;
    private _dynamicLengthRegex = /^(?<itemKey>\w+)\.(?<itemLengthType>\w+)$/;

    _recursion(model: Model, struct: T) {
        const entries = Object.entries(model);

        for (const [key, type] of entries) {
            // Catch dynamic item
            const dynamicLengthMatch = key.match(this._dynamicLengthRegex);

            // Dynamic item
            if (dynamicLengthMatch) {
                const {itemKey, itemLengthType} = dynamicLengthMatch.groups;
                this._writeDynamicItem(key, type, model, struct, itemKey, itemLengthType);
            }
            // Static item
            else {
                this._write(model, struct, key, type);
            }
        }
    }

    private _writeDynamicItem(key: string, itemsType: object | string, model: Model, struct: T, itemKey: string, itemLengthType: string) {
        const itemTypeIsString = itemsType === 's';
        const value = struct[itemKey];
        const length = value.length;
        // (some.i32: u8)
        // key: some.i32, itemsType: u8, itemKey: some, itemLengthType: i32

        // Write length
        this._writer.write(itemLengthType, length);

        // Write string
        if (itemTypeIsString) {
            this._writer.write('s', value);
        }
        // Write array of itemsType
        else {
            switch (typeof itemsType) {
                case 'object':
                    for (const structItem of value) {
                        this._recursion(itemsType, structItem);
                    }
                    break;
                case 'string':
                    for (const itemValue of value) {
                        this._writer.write(itemsType, itemValue);
                    }
                    break;
                default:
                    throw TypeError(`Unknown type "${itemsType}"`);
            }
        }
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

    toAtoms(): string[] {
        return this._writer.toAtoms();
    }
}