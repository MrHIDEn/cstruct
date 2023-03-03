export class ModelParser {
    static _checkWhetherTypeIsString(type) {
        return ["string", "s"].includes(type);
    }
    static _sizeType(type) {
        switch (type) {
            case 's':
            case 'string':
                return 's';
            case 'buf':
            case 'buffer':
                return 'buf';
            default:
                return;
        }
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
            const sizeType = this._sizeType(type);
            const isStatic = this._checkWhetherSizeIsNumber(size);
            let replacer;
            // Static
            if (isStatic) {
                if (+size < 0) {
                    throw Error(`Size must be >= 0.`);
                }
                if (sizeType) {
                    replacer = `${key}:${sizeType}${size}`;
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
                if (sizeType) {
                    replacer = `${key}.${size}:${sizeType}`;
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
        json = json.replace(/\s{2,}/g, ` `); // reduce spaces '\s'x to one ' '
        return json;
    }
    static staticArray(json) {
        // `[2/Abc]`    => `[Abc,Abc]`
        // `[2/u8]`     => `[u8,u8]`
        const matches = json.match(/\[\w+\/\w+]/g) ??
            [];
        for (const match of matches) {
            const m = match.match(/\[(?<size>\w+)\/(?<type>\w+)]/);
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
        // Static
        // `{some:s[2]}`      => `{some: s2}`
        // `{some:string[2]}` => `{some: s2}`
        // `{some:Abc[i8]}`    => `{some: [Abc,Abc]}`
        // `{some:buf[2]}`    => `{some: buf2}`
        // `{some:buffer[2]}` => `{some: buf2}`
        // Dynamic
        // `{some:s[i8]}`      => `{some.i8: s}`
        // `{some:string[i8]}` => `{some.i8: s}`
        // `{some:Abc[i8]}`    => `{some.i8: Abc}`
        // `{some:buf[i8]}`    => `{some.i8: buf}`
        // `{some:buffer[i8]}` => `{some.i8: buf}`
        const matches = json.match(/\w+:\w+\[\w+]/g) ??
            [];
        for (const match of matches) {
            const matchArray = match.match(/(?<key>\w+):?(?<type>\w+)\[(?<size>\w+)];?/);
            json = this._translateStaticAndDynamic(json, match, matchArray);
        }
        return json;
    }
    static cKindFields(json) {
        // `{u8 a,b;i32 x,y,z;}` => `{a:u8,b:u8,x:i32,y:i32,z:i32}`
        // `{Xyz x,y,z;}`       => `{x:Xyz,y:Xyz,z:Xyz}`
        const matches = json.match(/\w+\s[\w,]+;/g) ?? // match `u8 a,b;`
            [];
        for (const match of matches) {
            const matchArray = match.match(/(?<type>\w+)\s(?<keys>[\w,]+);/);
            if (matchArray?.length === 3) {
                const { type, keys } = matchArray.groups;
                const replacer = keys.split(',').map(key => `${key}:${type}`).join(',') + ',';
                json = json.split(match).join(replacer);
            }
        }
        return json;
    }
    static cKindStructs(json) {
        /* C STRUCTS
        1)                      2)
        typedef struct {        struct Ab {
            uint8_t x;              int8 x;
            uint8_t y;              int8 y;
            uint8_t z;          };
        } Xyz;                                  */
        // Warning: before this function all `u8 a,b;` become `a:u8,b:u8,`
        // 1) `{typedef struct{uint8_t x;uint8_t y;uint8_t z;}Xyz;}` => `{Xyz:{x:uint8_t,y:uint8_t,z:uint8_t}}`
        // 2) `{struct Ab{int8 x;int8 y;};}` => `{Ab:{x:int8,y:int8,z:int8}}`
        const matches = json.match(/(typedef struct{[\w\s,:]+}\w+;|struct \w+{[\w\s,:]+};)/g) ??
            [];
        for (const match of matches) {
            const matchArray = match.match(/typedef struct{(?<fields>[\w\s,:]+)}(?<structType>\w+);/) ??
                match.match(/struct (?<structType>\w+){(?<fields>[\w\s,:]+)};/);
            if (matchArray?.length === 3) {
                const { fields, structType } = matchArray.groups;
                const replacer = `${structType}:{${fields}},`;
                json = json.split(match).join(replacer);
            }
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
            // Parse user types
            const parsedTypesJson = this.parseTypes(types);
            const parsedTypes = JSON.parse(parsedTypesJson);
            // Prepare replacers
            const typeEntries = Object
                .entries(parsedTypes)
                .map(([type, replacer]) => [`"${type}"`, JSON.stringify(replacer)]);
            // Replace model with user types, stage 1
            typeEntries.forEach(([type, replacer]) => json = json.split(type).join(replacer));
            // Reverse user types to replace nested user types
            typeEntries.reverse();
            // Replace model with reverse user types, stage 2
            typeEntries.forEach(([type, replacer]) => json = json.split(type).join(replacer));
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
        json = this.cKindFields(json);
        json = this.cKindStructs(json);
        json = this.clearJson(json);
        json = this.replaceModelTypesWithUserTypes(json, types);
        json = this.fixJson(json);
        return json;
    }
}
ModelParser._allowedLengthTypes = 'u8,u16,u32,u64,i8,i16,i32,i64'.split(',');
//# sourceMappingURL=model-parser.js.map