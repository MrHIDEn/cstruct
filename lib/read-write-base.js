export class ReadWriteBase {
    constructor() {
        this._dynamicLengthRegex = /^(?<itemKey>\w+)\.(?<itemLengthType>\w+)$/;
    }
    _dynamicLengthMatch(key) {
        return key.match(this._dynamicLengthRegex);
    }
    _itemTypeIsStringOrBuffer(itemsType) {
        return ['s', 'buf'].includes(itemsType);
    }
}
//# sourceMappingURL=read-write-base.js.map