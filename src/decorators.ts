import { Model, Types } from "./types";


export function CStructModelProperty({type}: { type: string }) {
    return function (target: any, propertyKey: string) {
        if (!type) {
            throw Error(`Provide type.`);
        }
        if (!target.__cStructModel) {
            Object.defineProperty(target, '__cStructModel', {
                writable: true,
                value: {},
                // enumerable: false,
                // configurable: true
            });
            // target.__cStructModel = {};
        }
        target.__cStructModel[propertyKey] = type;
    };
}

export function CStructClass(options: { types?: Types, model?: Model }): <T extends { new(...args: any[]): {} }>(constructor: T) => any {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        function prepareModel(target: any) {
            const model = options.model ?? target.__cStructModel;
            const types = options.types ?? target.__cStructTypes;
            if (model && !target.__cStructModel) {
                Object.defineProperty(target, '__cStructModel', {writable: true, value: model,});
            }
            if (types && !target.__cStructTypes) {
                Object.defineProperty(target, '__cStructTypes', {writable: true, value: types,});
            }
            // NOTE null because we don't know yet endianness
            Object.defineProperty(target, '__cStruct', {writable: true, value: null,});
            return null;
        }

        return class extends constructor {
            __cStruct = prepareModel(this);
        }
    }
}

