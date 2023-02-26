import { Model, Types } from "./types";

export class ModelParser {
    private static _allowedLengthTypes = 'u8,u16,u32,u64,i8,i16,i32,i64'.split(',');

    private static _checkWhetherTypeIsString(type: string): boolean {
        return ["string", "s"].includes(type);
    }

    private static _checkWhetherSizeIsNumber(size: string): boolean {
        return !Number.isNaN(+size);
    }

    private static _checkWhetherLengthTypeIsAllowed(lengthType: string): boolean {
        return this._allowedLengthTypes.includes(lengthType);
    }

    private static _translateStaticAndDynamic(json: string, match: string, matchArray: RegExpMatchArray) {
        if (matchArray?.length === 4) {
            const {key, size, type} = matchArray.groups;
            const typeIsString = this._checkWhetherTypeIsString(type);
            const isStatic = this._checkWhetherSizeIsNumber(size);

            let replacer: string;
            // Static
            if (isStatic) {
                if (+size < 0) {
                    throw Error(`Size must be >= 0.`)
                }
                if (typeIsString) {
                    replacer = `${key}:s${size}`;
                } else {
                    replacer = `${key}:[${Array(+size).fill(type)}]`;
                }
            }
            // Dynamic
            else {
                if (!this._checkWhetherLengthTypeIsAllowed(size)) {
                    throw Error(`Unsupported dynamic length type.`);
                }
                if (typeIsString) {
                    replacer = `${key}.${size}:s`;
                } else {
                    replacer = `${key}.${size}:${type}`;
                }
            }

            json = json.split(match).join(replacer);
        }
        return json;
    }

    private static prepareJson(json: string): string {
        json = json.replace(/\/\/.*$/gm, ``); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.trim();
        json = json.replace(/['"]/g, ``); // remove all `'"`
        json = json.replace(/\s*([,:;{}[\]])\s*/g, `$1`); // remove spaces around `,:;{}[]`
        json = json.replace(/\s{2,}/g, ` `); // reduce ' 'x to one ' '

        return json;
    }

    private static staticArray(json: string): string {
        // `[2/Abc]`    => `[Abc,Abc]`
        // `[2/u8]`     => `[u8,u8]`
        const matches =
            json.match(/\[\w+\/\w+\]/g) ??
            [];
        for (const match of matches) {
            const m = match.match(/\[(?<size>\w+)\/(?<type>\w+)\]/);
            if (m?.length === 3) {
                const {size, type} = m.groups;
                const isNumber = this._checkWhetherSizeIsNumber(size);
                const typeIsString = this._checkWhetherTypeIsString(type);
                let replacer: string;
                // Static
                if (isNumber) {
                    if (+size < 0) {
                        throw Error(`Size must be >= 0.`)
                    }
                    if (typeIsString) {
                        throw Error(`Type must be other than string.`)
                    } else {
                        replacer = `[${Array(+size).fill(type)}]`;
                    }
                } else {
                    throw Error(`Size must be a number.`)
                }
                json = json.split(match).join(replacer);
            }
        }
        return json;
    }

    private static staticOrDynamic(json: string): string {
        // `{some:s[i8]}`      => `{some.i8: s}`
        // `{some:string[i8]}` => `{some.i8: s}`
        // `{some:Abc[i8]}`    => `{some.i8: Abc}`
        const matches =
            json.match(/\w+:\w+\[\w+\]/g) ??
            [];
        for (const match of matches) {
            const matchArray = match.match(/(?<key>\w+):?(?<type>\w+)\[(?<size>\w+)\];?/);
            json = this._translateStaticAndDynamic(json, match, matchArray);
        }
        return json;
    }

    private static clearJson(json: string): string {
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','
        json = json.replace(/(.*),$/, '$1'); // remove last ','
        json = json.replace(/([}\]])\s*([{[\w])/g, '$1,$2'); // add missing ',' between }] and {[
        json = json.replace(/(\w+\.?\w*)/g, '"$1"'); // Add missing ""
        return json;
    }

    private static replaceModelTypesWithUserTypes(json: string, types?: Types): string {
        if (types) {
            const parsedTypesJson = this.parseTypes(types);
            const parsedTypes = JSON.parse(parsedTypesJson);
            const typeEntries: [string, string][] = Object.entries(parsedTypes);
            // Replace model with user types, stage 1
            typeEntries.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
            // Reverse user types to replace nested user types
            typeEntries.reverse();
            // Replace model with reverse user types, stage 2
            typeEntries.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
        }
        return json;
    }

    private static fixJson(json: string): string {
        if (!json) {
            throw Error(`Invalid model '${json}'`);
        }
        // Reformat json
        try {
            const model = JSON.parse(json);
            return JSON.stringify(model);
        } catch (error) {
            throw Error(`Syntax error '${json}'. ${error.message}`);
        }
    }

    static parseTypes(types: Types): string {
        if (!types) {
            return;
        }
        if (Array.isArray(types)) {
            throw Error(`Invalid types '${types}'`);
        }

        switch (typeof types) {
            case "string":
            case "object":
                return ModelParser.parseModel(types);
            default:
                throw Error(`Invalid types '${types}'`);
        }
    }

    static parseModel(model: Model, types?: Types): string {
        if (!model) {
            throw Error(`Invalid model '${model ?? typeof model}'`);
        }

        let json = (typeof model) === 'string' ? model as string : JSON.stringify(model); // stringify
        json = this.prepareJson(json);
        json = this.staticArray(json);
        json = this.staticOrDynamic(json);
        json = this.clearJson(json);
        json = this.replaceModelTypesWithUserTypes(json, types);
        json = this.fixJson(json);

        return json;
    }
}