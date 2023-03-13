import { Model, Types } from "./types";


export function CStructModelProperty({type}: { type: string }) {
    return function (target: any, propertyKey: string) {
        if (!type) {
            throw Error(`Provide type.`);
        }
        if (!target._cStructModel) {
            target._cStructModel = {};
        }
        target._cStructModel[propertyKey] = type;
    };
}

export function CStructClass(options: { types?: Types, model?: Model }): <T extends { new(...args: any[]): {} }>(constructor: T) => any {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        function prepareModel(target: any) {
            target._cStructModel = options.model ?? target._cStructModel;
            target._cStructTypes = options.types ?? target._cStructTypes;
            return null; // NOTE null because we don't know yet endianness
        }

        return class extends constructor {
            _cStruct = prepareModel(this);
        }
    }
}

