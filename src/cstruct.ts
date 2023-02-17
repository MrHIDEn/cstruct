import { Model, Types } from "./types";
import { ModelParser } from "./model-parser";

/**
 * CStruct
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStruct<T> {
    _jsonModel: string;

    constructor(model: Model, types?: Types) {
        this._jsonModel = ModelParser.parse(model, types);
    }

    get jsonModel(): string {
        return this._jsonModel;
    }

    get modelClone(): Model {
        return JSON.parse(this._jsonModel) as Model;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    read(buffer: Buffer, offset = 0) {
        throw Error("This is abstract class");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    write(buffer: Buffer, struct: T, offset = 0) {
        throw Error("This is abstract class");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    make(struct: T) {
        throw Error("This is abstract class");
    }
}