import { CStructClassOptions } from "./types";
import { CStructBE } from "./cstruct-be";
import { CStructLE } from "./cstruct-le";


export function CStructModelProperty({type}: { type: string }) {
    return function (target: any, propertyKey: string) {
        if (!type) {
            throw Error(`Provide type.`);
        }
        if (!target.model) {
            target.model = {};
        }
        target.model[propertyKey] = type;
    };
}

export function CStructBEClass(options: CStructClassOptions = {})
{
    const symbol = Symbol('cStruct');
    let cStruct = null;

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        function compile(target: any) {
            cStruct = new CStructBE(target.model, options?.types);
            return cStruct;
        }

        function make() {
            return cStruct.make(this);
        }

        function write(buffer: Buffer, offset?: number) {
            return cStruct.make(buffer, this, offset);
        }

        function read(buffer: Buffer, offset?: number) {
            const result = cStruct.read(buffer, offset);
            const struct = result.struct;
            Object.entries(struct).forEach(([key, value]) => {
                this[key] = value;
            });
            return result;
        }

        return class extends constructor {
            [symbol] = compile(this);

            make = make;
            write = write;
            read = read;
        };
    }
}

export function CStructLEClass(options: CStructClassOptions = {}) {
    const symbol = Symbol('cStruct');
    let cStruct = null;

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {

        function compile(target: any) {
            cStruct = new CStructLE(target.model, options?.types);
            return cStruct;
        }

        function make() {
            return cStruct.make(this);
        }

        function write(buffer: Buffer, offset?: number) {
            return cStruct.make(buffer, this, offset);
        }

        function read(buffer: Buffer, offset?: number) {
            const result = cStruct.read(buffer, offset);
            const struct = result.struct;
            Object.entries(struct).forEach(([key, value]) => {
                this[key] = value;
            });
            return result;
        }

        return class extends constructor {
            [symbol] = compile(this);

            make = make;
            write = write;
            read = read;
        };
    }
}
