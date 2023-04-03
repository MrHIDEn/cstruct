import { Type, SpecialType } from "./types";


export class ReadWriteBase {
    protected _typeLengthRegex = /^(?<dynamicType>\w+)\.(?<dynamicLength>\w+)$/;
    private _stringTypes = ['s', 'string'];
    private _bufferTypes = ['buf', 'buffer'];
    private _jsonTypes = ['j', 'json', 'any'];

    protected _getTypeLengthGroupsMatch(key: string) {
        return key.match(this._typeLengthRegex)?.groups;
    }

    protected _getSpecialType(modelType: Type): SpecialType | undefined {
        if (this._stringTypes.includes(modelType as string)) {
            return SpecialType.String;
        }
        if (this._bufferTypes.includes(modelType as string)) {
            return SpecialType.Buffer;
        }
        if (this._jsonTypes.includes(modelType as string)) {
            return SpecialType.Json;
        }
    }

    protected _getStaticSize(size: string): { isStatic: boolean, staticSize: number } {
        const value = +size;
        return {
            isStatic: !Number.isNaN(value),
            staticSize: value
        };
    }

    protected extractTypeAndSize(modelType: object | string, dynamicLength: string)
        : { specialType: SpecialType | undefined, isStatic: boolean, staticSize: number } {
        const specialType = this._getSpecialType(modelType);
        const {isStatic, staticSize} = this._getStaticSize(dynamicLength);
        return {specialType, isStatic, staticSize};
    }
}