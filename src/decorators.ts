import { CStructMetadata } from "./decorators-metadata";
import { CStructPOptions, Dictionary } from "./decorators-types";
import { CStructCOptions } from "./decorators-types";


export function CStructClass(options: CStructCOptions = {}) {
    return function <T>(target: T & Dictionary) {
        CStructMetadata.addClass(target, options);
        return target;
    };
}

export function CStructProperty(options: CStructPOptions) {
    return function <T>(target: T & Dictionary, propertyName: string) {
        CStructMetadata.addProperty(target, propertyName, options);
    }
}