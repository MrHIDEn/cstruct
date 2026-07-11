import { Model, Types } from "./types";
import { ModelParser } from "./model-parser";


export class CStruct<T> {
    protected _jsonModel: string;
    protected _jsonTypes: Types;

    constructor(model?: Model, types?: Types, compiledJsonModel?: string) {
        this._jsonTypes = types;
        if (compiledJsonModel !== undefined) {
            this._jsonModel = CStruct.normalizeCompiledJsonModel(compiledJsonModel);
        } else {
            this._jsonModel = ModelParser.parseModel(model, types);
        }
    }

    static normalizeCompiledJsonModel(input: string | Model): string {
        const json = typeof input === 'string' ? input : JSON.stringify(input);
        let parsed: unknown;
        try {
            parsed = JSON.parse(json);
        } catch {
            throw new Error('Compiled model must be valid JSON.');
        }
        if (parsed === null || typeof parsed !== 'object') {
            throw new Error('Compiled model must be a JSON object or array.');
        }
        return json;
    }

    get jsonTypes(): string {
        return this._jsonTypes ? ModelParser.parseModel(this._jsonTypes) : undefined;
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