import { ReadWriteBase } from "./read-write-base";
export class Make extends ReadWriteBase {
    _recursion(model, struct) {
        const entries = Object.entries(model);
        for (const [key, type] of entries) {
            // Catch dynamic item
            const dynamicLengthMatch = this._dynamicLengthMatch(key);
            // Dynamic item
            if (dynamicLengthMatch) {
                const { itemKey, itemLengthType } = dynamicLengthMatch.groups;
                this._writeDynamicItem(key, type, struct, itemKey, itemLengthType);
            }
            // Static item
            else {
                this._write(model, struct, key, type);
            }
        }
    }
    _writeDynamicItem(key, itemsType, struct, itemKey, itemLengthType) {
        const itemTypeIsStringOrBuffer = this._itemTypeIsStringOrBuffer(itemsType);
        const value = struct[itemKey];
        const length = value.length;
        // (some.i32: u8)
        // key: some.i32, itemsType: u8, itemKey: some, itemLengthType: i32
        // Write length
        this._writer.write(itemLengthType, length);
        // Write string
        if (itemTypeIsStringOrBuffer) {
            this._writer.write(itemsType, value);
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
    _write(model, struct, key, type) {
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
    toAtoms() {
        return this._writer.toAtoms();
    }
}
//# sourceMappingURL=make.js.map