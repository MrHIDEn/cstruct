import { CStructMetadata } from "./decorators-metadata";
import { CStructPropertyOptions, Dictionary } from "./decorators-types";
import { CStructClassOptions } from "./decorators-types";


export function CStructClass(options: CStructClassOptions = {}) {
    return function <T>(target: T & Dictionary) {
        CStructMetadata.addClass(target, options);
        return target;
    };
}

export function CStructProperty(options: CStructPropertyOptions) {
    return function <T>(target: T & Dictionary, propertyName: string) {
        CStructMetadata.addProperty(target, propertyName, options);
    }
}