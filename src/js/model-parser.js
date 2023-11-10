const { Model, Types } = require("./types");

/**
 * @class
 */
class ModelParser {
    /**
     * @constructor
     */
    constructor() {
        this._allowedLengthTypes = 'u8,u16,u32,u64,i8,i16,i32,i64'.split(',');
    }

    /**
     * @private
     * @param {string} size
     * @returns {boolean}
     */
    static _checkWhetherSizeIsNumber(size) {
        return !Number.isNaN(+size);
    }

    /**
     * @private
     * @param {string} size
     */
    static _checkSize(size) {
        if (!this._allowedLengthTypes.includes(size) && !this._checkWhetherSizeIsNumber(size)) {
            throw Error(`Unsupported size "${size}".`);
        }
    }

    /**
     * @private
     * @param {string} size
     * @returns {{ isNumber: boolean, staticSize: number }}
     */
    static _getSize(size) {
        const value = +size;
        return {
            isNumber: !Number.isNaN(value),
            staticSize: value
        };
    }

    /**
     * @private
     * @param {any} json
     * @returns {any}
     */
    static _removeComments(json) {
        return json
            .split('\n')
            .map(line => {
                const commentIndex = line.indexOf('//');
                if (commentIndex === -1) {
                    return line;
                }
                return line.slice(0, commentIndex);
            })
            .join('\n');
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static prepareJson(json) {
        json = this._removeComments(json); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.trim();
        json = json.replace(/['"]/g, ``); // remove all `'"`
        json = json.replace(/\s*([,:;{}[\]])\s*/g, `$1`); // remove spaces around `,:;{}[]`
        json = json.replace(/\s{2,}/g, ` `); // reduce spaces '\s'x to one ' '
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static arrayOfItems1(json) {
        // Static `itemType[size]`
        // `Abc[2]`   => `[Abc,Abc]`
        const matches = json.match(/^\w+\[\w+]$/g) ?? [];
        for (const match of matches) {
            const groups = match.match(/^(?<type>\w+)\[(?<size>\w+)]$/)?.groups;
            const { size, type } = groups;
            const { isNumber, staticSize } = this._getSize(size);
            if (isNumber) {
                const replacer = `[${Array(staticSize).fill(type).join(',')}]`;
                json = json.split(match).join(replacer);
            } else {
                throw Error(`Unsupported size "${size}".`);
            }
        }
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static arrayOfItems2(json) {
        // Static [itemType/size]
        // `[Abc/2]` `[Abc,Abc]`
        const matches = json.match(/\[\w+\/\w+]/g) ?? [];
        for (const match of matches) {
            const groups = match.match(/\[(?<type>\w+)\/(?<size>\w+)]/)?.groups;
            const { size, type } = groups;
            const { isNumber, staticSize } = this._getSize(size);
            if (isNumber) {
                const replacer = `[${Array(staticSize).fill(type).join(',')}]`;
                json = json.split(match).join(replacer);
            } else {
                throw Error(`Unsupported size "${size}".`);
            }
        }
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static staticOrDynamicArray(json) {
        // Static
        // `{some:s[2]}`      => `{some: s2}`
        // `{some:string[2]}` => `{some: s2}`
        // `{some:Abc[i8]}`   => `{some: [Abc,Abc]}`

        // ... rest of the code ...
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static justArray(json) {
        // Static
        // `s[2]`       => `s.2`
        // `string[2]`  => `s.2`
        // `Abc[2]`     => `Abc.2`
        // `buf[2]`     => `buf.2`
        // `buffer[2]`  => `buf.2`
        // `i16[2]`     => `i16.2`
        // `j[2]`       => `j.2`
        // `json[2]`    => `j.2`
        // `any[2]`     => `j.2`
        // Dynamic
        // `s[i8]`      => `s.i8`
        // `string[i8]` => `s.i8`
        // `Abc[i8]`    => `Abc.i8`
        // `buf[i8]`    => `buf.i8`
        // `buffer[i8]` => `buf.i8`
        // `i16[i8]`    => `i16.i8`
        // `j[i8]`      => `j.i8`
        // `json[i8]`   => `j.i8`
        // `any[i8]`    => `j.i8`
        const matches = json.match(/\w+\[\w+]/g) ?? [];
        for (const match of matches) {
            const groups = match.match(/(?<type>\w+)\[(?<size>\w+)];?/)?.groups;
            const { type, size } = groups;
            this._checkSize(size);
            const replacer = `${type}.${size}`;
            json = json.split(match).join(replacer);
        }
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static cKindFields(json) {
        // `{u8 a,b;i32 x,y,z;}` => `{a:u8,b:u8,x:i32,y:i32,z:i32}`
        // `{Xyz x,y,z;}`       => `{x:Xyz,y:Xyz,z:Xyz}`
        const matches = json.match(/\w+\s[\w,]+;/g) ?? []; // match `u8 a,b;`
        for (const match of matches) {
            const groups = match.match(/(?<type>\w+)\s(?<fields>[\w,]+);/)?.groups;
            const { type, fields } = groups;
            const replacer = fields.split(',').map(field => `${field}:${type}`).join(',') + ',';
            json = json.split(match).join(replacer);
        }
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
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
        const matches = json.match(/(typedef struct{[\w\s,:]+}\w+;|struct \w+{[\w\s,:]+};)/g) ?? [];
        for (const match of matches) {
            const groups = match.match(/typedef struct{(?<fields>[\w\s,:]+)}(?<type>\w+);/)?.groups ?? match.match(/struct (?<type>\w+){(?<fields>[\w\s,:]+)};/)?.groups;
            const { fields, type } = groups;
            const replacer = `${type}:{${fields}},`;
            json = json.split(match).join(replacer);
        }
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static clearJson(json) {
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','
        json = json.replace(/(.*),$/, '$1'); // remove last ','
        json = json.replace(/([}\]])\s*([{[\w])/g, '$1,$2'); // add missing ',' between }] and {[
        json = json.replace(/(\w+\.?\w*)/g, '"$1"'); // Add missing ""
        return json;
    }

    /**
     * @private
     * @param {string} json
     * @param {Types} types
     * @returns {string}
     */
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

    /**
     * @private
     * @param {string} json
     * @returns {string}
     */
    static fixJson(json) {
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

    /**
     * @param {Types} types
     * @returns {string}
     */
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

    /**
     * @param {Model} model
     * @param {Types} types
     * @returns {string}
     */
    static parseModel(model, types) {
        if (!model) {
            throw Error(`Invalid model '${model ?? typeof model}'`);
        }

        let json = (typeof model) === 'string' ? model : JSON.stringify(model); // stringify
        json = this.prepareJson(json);
        json = this.arrayOfItems1(json);
        json = this.arrayOfItems2(json);
        json = this.staticOrDynamicArray(json);
        json = this.justArray(json);
        json = this.cKindFields(json);
        json = this.cKindStructs(json);
        json = this.clearJson(json);
        json = this.replaceModelTypesWithUserTypes(json, types);
        json = this.fixJson(json);

        return json;
    }
}