import { Model, Types } from "./types";
export declare class ModelParser {
    private static _allowedLengthTypes;
    private static _checkWhetherTypeIsString;
    private static _checkWhetherSizeIsNumber;
    private static _checkWhetherLengthTypeIsAllowed;
    private static _translateStaticAndDynamic;
    private static prepareJson;
    private static staticArray;
    private static staticOrDynamic;
    private static cKindFields;
    private static clearJson;
    private static replaceModelTypesWithUserTypes;
    private static fixJson;
    static parseTypes(types: Types): string;
    static parseModel(model: Model, types?: Types): string;
}
//# sourceMappingURL=model-parser.d.ts.map