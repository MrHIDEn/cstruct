import { Model, Types } from "./types";
export declare class ModelParser {
    private static _prepareJson;
    private static _special1CKindDynamicArrayOrString1;
    private static _special2CKindArrayOrString;
    private static _special3DynamicStringOrArray;
    private static _special4StaticArray2;
    private static _special5CKindBracketNess;
    private static _special6CKindBracketLess;
    private static _clearJson;
    private static _replaceModelTypesWithUserTypes;
    private static _fixJson;
    static parseTypes(types: Types): string;
    static parseModel(model: Model, types?: Types): string;
}
//# sourceMappingURL=model-parser.d.ts.map