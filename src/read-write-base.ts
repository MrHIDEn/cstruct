import { Type } from "./types";


export class ReadWriteBase {
    protected _dynamicLengthRegex = /^(?<dynamicKey>\w+)\.(?<dynamicLength>\w+)$/;

    protected _dynamicGroupsMatch(key: string) {
        return key.match(this._dynamicLengthRegex)?.groups;
    }

    protected _itemTypeIsStringOrBuffer(itemsType: Type) {
        return ['s', 'buf'].includes(itemsType as string);
    }

    protected _getSize(size: string): {isNumber: boolean, staticSize: number} {
        const value = +size;
        return {
            isNumber: !Number.isNaN(value),
            staticSize: value
        };
    }
}