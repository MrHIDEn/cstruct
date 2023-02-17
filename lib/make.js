export class Make {
    _recursion(model, struct) {
        const entries = Object.entries(model);
        let keyArray;
        let keyString;
        for (let [key, type] of entries) {
            // Dynamic array.
            if (typeof keyArray === 'string') {
                this._writeDynamicArray(keyArray, key, struct, model, type);
                keyArray = undefined;
                continue;
            }
            // Dynamic string.
            else if (typeof keyString === 'string') {
                this._writeDynamicString(keyString, key, model, struct);
                keyString = undefined;
                continue;
            }
            // Prepare dynamic array.
            if (key.endsWith('.array')) {
                keyArray = key;
                continue;
            }
            // Prepare dynamic string.
            else if (key.endsWith('.string')) {
                keyString = key;
                continue;
            }
            // Normal item/items
            else {
                keyArray = undefined;
                keyString = undefined;
            }
            // Write item
            this._write(model, struct, key, type);
        }
    }
    /**
     * Writing dynamic array. Array length is written before array items.
     * <stringLength><string>
     */
    _writeDynamicArray(keyArray, key, struct, model, type) {
        if (keyArray.slice(0, -6) !== key)
            throw SyntaxError(`A key 'aKey' must follow array declaration 'aKey.array'.`);
        if (!Array.isArray(struct[key]))
            throw SyntaxError(`An array 'aKey' must follow array declaration 'aKey.array'.`);
        // Write array length
        const typeLength = model[keyArray];
        const arrayLength = struct[key].length;
        this._writer.write(typeLength, arrayLength);
        // Write array items
        const itemsType = model[key];
        switch (typeof itemsType) {
            case 'object':
                for (const structItem of struct[key]) {
                    this._recursion(itemsType, structItem);
                }
                break;
            case 'string':
                for (const itemValue of struct[key]) {
                    this._writer.write(itemsType, itemValue);
                }
                break;
            default:
                throw TypeError(`Unknown type "${type}"`);
        }
    }
    /**
     * Writing dynamic string. String length is written before string.
     * <stringLength><string>
     */
    _writeDynamicString(keyString, key, model, struct) {
        if (keyString.slice(0, -7) !== key)
            throw SyntaxError(`A key 'aKey' must follow string declaration 'aKey.string'.`);
        if (model[key] != 'string')
            throw SyntaxError(`An object 'aKey' must be type 'string' after string declaration 'aKey.string'.`);
        if (typeof struct[key] != 'string')
            throw SyntaxError(`An followed 'aKey' must equal 'string' after declaration 'aKey.string'.`);
        // Write string length
        const stringValue = struct[key];
        const typeLength = model[keyString];
        const stringLength = stringValue.length;
        this._writer.write(typeLength, stringLength);
        // Write string
        this._writer.write('str', stringValue);
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
}
//# sourceMappingURL=make.js.map