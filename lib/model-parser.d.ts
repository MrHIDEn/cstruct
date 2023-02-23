import { Model, Types } from "./types";
export declare class ModelParser {
    private static _extractCKindFields;
    private static prepareJson;
    private static dynamicStringOrArray;
    private static staticArray;
    private static CKindStruct;
    private static CKindFields;
    private static CKindStaticAndDynamicArrayOrString;
    private static CKindStaticArrayOrString;
    private static clearJson;
    private static replaceModelTypesWithUserTypes;
    private static fixJson;
    static parseTypes(types: Types): string;
    static parseModel(model: Model, types?: Types): string;
}
//# sourceMappingURL=model-parser.d.ts.map