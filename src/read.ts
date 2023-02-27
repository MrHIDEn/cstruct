import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { StructEntry, Type } from "./types";


export class Read<T> {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;
    private _dynamicLengthRegex = /^(?<itemKey>\w+)\.(?<itemLengthType>\w+)$/;

    _recursion(struct: T) {
        const entries: StructEntry[] = Object.entries(struct);

        for (const [key, type] of entries) {
            // Catch dynamic item
            const dynamicLengthMatch = key.match(this._dynamicLengthRegex);

            // Dynamic item
            if (dynamicLengthMatch) {
                const {itemKey, itemLengthType} = dynamicLengthMatch.groups;
                this._readDynamicItem(key, type, struct, itemKey, itemLengthType);
            }
            // Static item
            else {
                this._read(struct, key, type);
            }
        }
    }

    private _readDynamicItem(key: string, itemsType: Type, struct: T, itemKey: string, itemLengthType: string) {
        const itemTypeIsString = itemsType === 's';

        // Read length
        const length = this._reader.read(itemLengthType);
        // (some.i32: u8)
        // key: some.i32, itemsType: u8, itemKey: some, itemLengthType: i32
        // => delete some.i32, use (some: [u8, ...*i32] or some: s<*i32>)
        delete struct[key];

        // Read string
        if (itemTypeIsString) {
            struct[itemKey] = this._reader.read(`s${length}`);
        }
            // Read array of itemsType
            // // Read array items
            // const itemsType = struct[key];
            // struct[key] = Array(arrayLength).fill(itemsType);
        // this._recursion(struct[key]);
        else {
            switch (typeof itemsType) {
                case 'object': {
                    const json = JSON.stringify(itemsType);
                    struct[itemKey] = Array(length).fill(0).map(() => JSON.parse(json));
                    this._recursion(struct[itemKey]);
                    break;
                }
                case 'string':
                    struct[itemKey] = Array(length).fill(itemsType);
                    this._recursion(struct[itemKey]);
                    break;
                default:
                    throw TypeError(`Unknown type "${itemsType}"`);
            }
        }
    }

    _read(struct: T, key: string, type: Type) {
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

    toAtoms(): string[] {
        return this._reader.toAtoms();
    }
}