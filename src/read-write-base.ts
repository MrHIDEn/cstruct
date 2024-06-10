import { Type, SpecialType } from "./types";


export class ReadWriteBase {
    protected dynamicTypeLengthRegex = /^(?<dynamicType>\w+)\.(?<dynamicLength>\w+)$/;
    protected staticTypeLengthRegex = /^(?<staticType>\w+)(?<staticLength>\d+)$/;
    private stringTypes = ['s', 'string'];
    private wstringTypes = ['ws', 'wstring'];
    private bufferTypes = ['buf', 'buffer'];
    private jsonTypes = ['j', 'json', 'any'];

    protected getDynamicTypeLengthGroupsMatch(key: string) {
        return key.match(this.dynamicTypeLengthRegex)?.groups;
    }

    protected getStaticTypeLengthGroupsMatch(key: string) {
        return key.match(this.staticTypeLengthRegex)?.groups;
    }

    protected getSpecialType(modelType: Type): SpecialType | undefined {
        if (this.stringTypes.includes(modelType as string)) {
            return SpecialType.String;
        }
        if (this.wstringTypes.includes(modelType as string)) {
            return SpecialType.WString;
        }
        if (this.bufferTypes.includes(modelType as string)) {
            return SpecialType.Buffer;
        }
        if (this.jsonTypes.includes(modelType as string)) {
            return SpecialType.Json;
        }
    }

    protected getStaticSize(size: string): { isStatic: boolean, staticSize: number } {
        const value = +size;
        return {
            isStatic: !Number.isNaN(value),
            staticSize: value
        };
    }

    protected extractTypeAndSize(modelType: object | string, dynamicLength: string)
        : { specialType: SpecialType | undefined, isStatic: boolean, staticSize: number } {
        const specialType = this.getSpecialType(modelType);
        const {isStatic, staticSize} = this.getStaticSize(dynamicLength);
        return {specialType, isStatic, staticSize};
    }
}