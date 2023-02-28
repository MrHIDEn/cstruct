import { Type } from "./types";


export class ReadWriteBase {
    protected _dynamicLengthRegex = /^(?<itemKey>\w+)\.(?<itemLengthType>\w+)$/;

    protected _dynamicLengthMatch(key: string) {
        return key.match(this._dynamicLengthRegex);
    }

    protected _itemTypeIsStringOrBuffer(itemsType: Type) {
        return ['s', 'buf'].includes(itemsType as string);
    }
}