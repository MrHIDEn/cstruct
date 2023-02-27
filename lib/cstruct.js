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
        this._jsonTypes = types;
        this._jsonModel = ModelParser.parseModel(model, types);
    }
    get jsonTypes() {
        return this._jsonTypes ? ModelParser.parseModel(this._jsonTypes) : undefined;
    }
    get jsonModel() {
        return this._jsonModel;
    }
    get typesClone() {
        return this._jsonTypes ? JSON.parse(this.jsonTypes) : undefined;
    }
    get modelClone() {
        return JSON.parse(this._jsonModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    read(buffer, offset = 0) {
        throw Error("This is abstract class");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    write(buffer, struct, offset = 0) {
        throw Error("This is abstract class");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    make(struct) {
        throw Error("This is abstract class");
    }
}
//# sourceMappingURL=cstruct.js.map