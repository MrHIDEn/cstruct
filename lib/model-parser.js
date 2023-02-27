export class ModelParser {
    static _checkWhetherTypeIsString(type) {
        return ["string", "s"].includes(type);
    }
    static _checkWhetherSizeIsNumber(size) {
        return !Number.isNaN(+size);
    }
    static _checkWhetherLengthTypeIsAllowed(lengthType) {
        return this._allowedLengthTypes.includes(lengthType);
    }
    static _translateStaticAndDynamic(json, match, matchArray) {
        if (matchArray?.length === 4) {
            const { key, size, type } = matchArray.groups;
            const typeIsString = this._checkWhetherTypeIsString(type);
            const isStatic = this._checkWhetherSizeIsNumber(size);
            let replacer;
            // Static
            if (isStatic) {
                if (+size < 0) {
                    throw Error(`Size must be >= 0.`);
                }
                if (typeIsString) {
                    replacer = `${key}:s${size}`;
                }
                else {
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
                }
                else {
                    replacer = `${key}.${size}:${type}`;
                }
            }
            json = json.split(match).join(replacer);
        }
        return json;
    }
    static prepareJson(json) {
        json = json.replace(/\/\/.*$/gm, ``); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.trim();
        json = json.replace(/['"]/g, ``); // remove all `'"`
        json = json.replace(/\s*([,:;{}[\]])\s*/g, `$1`); // remove spaces around `,:;{}[]`
        json = json.replace(/\s{2,}/g, ` `); // reduce ' 'x to one ' '
        return json;
    }
    static staticArray(json) {
        // `[2/Abc]`    => `[Abc,Abc]`
        // `[2/u8]`     => `[u8,u8]`
        const matches = json.match(/\[\w+\/\w+\]/g) ??
            [];
        for (const match of matches) {
            const m = match.match(/\[(?<size>\w+)\/(?<type>\w+)\]/);
            if (m?.length === 3) {
                const { size, type } = m.groups;
                const isNumber = this._checkWhetherSizeIsNumber(size);
                const typeIsString = this._checkWhetherTypeIsString(type);
                let replacer;
                // Static
                if (isNumber) {
                    if (+size < 0) {
                        throw Error(`Size must be >= 0.`);
                    }
                    if (typeIsString) {
                        throw Error(`Type must be other than string.`);
                    }
                    else {
                        replacer = `[${Array(+size).fill(type)}]`;
                    }
                }
                else {
                    throw Error(`Size must be a number.`);
                }
                json = json.split(match).join(replacer);
            }
        }
        return json;
    }
    static staticOrDynamic(json) {
        // `{some:s[i8]}`      => `{some.i8: s}`
        // `{some:string[i8]}` => `{some.i8: s}`
        // `{some:Abc[i8]}`    => `{some.i8: Abc}`
        const matches = json.match(/\w+:\w+\[\w+\]/g) ??
            [];
        for (const match of matches) {
            const matchArray = match.match(/(?<key>\w+):?(?<type>\w+)\[(?<size>\w+)\];?/);
            json = this._translateStaticAndDynamic(json, match, matchArray);
        }
        return json;
    }
    static clearJson(json) {
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','
        json = json.replace(/(.*),$/, '$1'); // remove last ','
        json = json.replace(/([}\]])\s*([{[\w])/g, '$1,$2'); // add missing ',' between }] and {[
        json = json.replace(/(\w+\.?\w*)/g, '"$1"'); // Add missing ""
        return json;
    }
    static replaceModelTypesWithUserTypes(json, types) {
        if (types) {
            const parsedTypesJson = this.parseTypes(types);
            const parsedTypes = JSON.parse(parsedTypesJson);
            const typeEntries = Object.entries(parsedTypes);
            // Replace model with user types, stage 1
            typeEntries.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
            // Reverse user types to replace nested user types
            typeEntries.reverse();
            // Replace model with reverse user types, stage 2
            typeEntries.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
        }
        return json;
    }
    static fixJson(json) {
        if (!json) {
            throw Error(`Invalid model '${json}'`);
        }
        // Reformat json
        try {
            const model = JSON.parse(json);
            return JSON.stringify(model);
        }
        catch (error) {
            throw Error(`Syntax error '${json}'. ${error.message}`);
        }
    }
    static parseTypes(types) {
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
    static parseModel(model, types) {
        if (!model) {
            throw Error(`Invalid model '${model ?? typeof model}'`);
        }
        let json = (typeof model) === 'string' ? model : JSON.stringify(model); // stringify
        json = this.prepareJson(json);
        json = this.staticArray(json);
        json = this.staticOrDynamic(json);
        json = this.clearJson(json);
        json = this.replaceModelTypesWithUserTypes(json, types);
        json = this.fixJson(json);
        return json;
    }
}
ModelParser._allowedLengthTypes = 'u8,u16,u32,u64,i8,i16,i32,i64'.split(',');
//# sourceMappingURL=model-parser.js.map