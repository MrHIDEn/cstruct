import { ModelParser } from "./model-parser";
/**
 * CStruct
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStruct {
    constructor(model, types) {
        this._jsonModel = ModelParser.parse(model, types);
    }
    get jsonModel() {
        return this._jsonModel;
    }
    get modelClone() {
        return JSON.parse(this._jsonModel);
    }
    read(buffer, offset = 0) {
        throw Error("This is abstract class");
    }
    write(buffer, struct, offset = 0) {
        throw Error("This is abstract class");
    }
    make(struct) {
        throw Error("This is abstract class");
    }
}
//# sourceMappingURL=cstruct.js.map