import { Model, Types } from "./types";
import { CStructBE } from "./cstruct-be";
import { CStructLE } from "./cstruct-le";

export type Constructor<T = unknown> = new (...args: any[]) => T;
export type Dictionary<T = any> = { [k: string]: T };
export type CStructCOptions = {
    types?: Types,
    model?: Model
}
export type CStructPOptions = {
    type: string,
}

export class CStructMetadata {
    model: Model;
    types: Types;
    cStruct: CStructBE<any> | CStructLE<any>;
    class: Constructor<any>;
    className: string;
    static CStructSymbol = Symbol('CStruct');

    constructor() {
        this.model = {};
        this.types = {};
        this.cStruct = null;
    }

    static getMetadata(target: any) {
        const constructorMetadata = target.constructor?.[this.CStructSymbol];
        const prototypeMetadata = target.prototype?.[this.CStructSymbol];
        const targetMetadata = target[this.CStructSymbol];
        let metadata = constructorMetadata ?? prototypeMetadata ?? targetMetadata;
        if (!metadata) {
            metadata = target[this.CStructSymbol] = new CStructMetadata();
        }
        return metadata;
    }

    static addProperty<T>(target: T & Dictionary, propertyName: string, options: CStructPOptions) {
        const metadata = CStructMetadata.getMetadata(target);
        metadata.model[propertyName] = options.type;
    }

    static addClass<T>(target: T & Dictionary, options: CStructCOptions) {
        const metadata = CStructMetadata.getMetadata(target);
        metadata.types = options.types;
        metadata.model = options.model;
        metadata.class = target as unknown as Constructor<T>;
        metadata.className = target.name;
    }

    static getCStructBE<T>(struct: T): CStructBE<T> {
        const metadata = CStructMetadata.getMetadata(struct);
        if (!metadata.cStruct) {
            if (!metadata.model) {
                throw Error(`Provided struct is not decorated.`);
            }
            metadata.cStruct = new CStructBE(metadata.model, metadata.types);
        }
        return metadata.cStruct as CStructBE<T>;
    }

    static getCStructLE<T>(struct: T): CStructLE<T> {
        const metadata = CStructMetadata.getMetadata(struct);
        if (!metadata.cStruct) {
            if (!metadata.model) {
                throw Error(`Provided struct is not decorated.`);
            }
            metadata.cStruct = new CStructLE(metadata.model, metadata.types);
        }
        return metadata.cStruct as CStructLE<T>;
    }

    static getModel<T>(struct: T): Model {
        const metadata = CStructMetadata.getMetadata(struct);
        return metadata.model;
    }

    static getTypes<T>(struct: T): Types {
        const metadata = CStructMetadata.getMetadata(struct);
        return metadata.types;
    }
}

export function CStructProperty(options: CStructPOptions) {
    return function <T>(target: T & Dictionary, propertyName: string) {
        CStructMetadata.addProperty(target, propertyName, options);
    }
}

export function CStructClass(options: CStructCOptions = {}) {
    return function <T>(target: T & Dictionary) {
        CStructMetadata.addClass(target, options);
        return target;
    };
}