import { Model, Types } from "./types";

export class ModelParser {
    private static _allowedLengthTypes = 'u8,u16,u32,u64,i8,i16,i32,i64'.split(',');

    private static _checkWhetherSizeIsNumber(size: string): boolean {
        return !Number.isNaN(+size);
    }

    private static _checkSize(size: string): void {
        if (!this._allowedLengthTypes.includes(size) && !this._checkWhetherSizeIsNumber(size)) {
            throw Error(`Unsupported size "${size}".`);
        }
    }

    private static _getSize(size: string): { isNumber: boolean, staticSize: number } {
        const value = +size;
        return {
            isNumber: !Number.isNaN(value),
            staticSize: value
        };
    }

    private static prepareJson(json: string): string {
        json = json.replace(/\/\/.*$/gm, ``); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.trim();
        json = json.replace(/['"]/g, ``); // remove all `'"`
        json = json.replace(/\s*([,:;{}[\]])\s*/g, `$1`); // remove spaces around `,:;{}[]`
        json = json.replace(/\s{2,}/g, ` `); // reduce spaces '\s'x to one ' '
        json = json.replace(/string(\d+|\/|\[\w+])/g, `s$1`); // replace 'string' with 's'
        json = json.replace(/buffer(\d+|\/|\[\w+])/g, `buf$1`); // reduce 'buffer' with 'buf'

        return json;
    }

    private static arrayOfItems1(json: string): string {
        // Static `itemType[size]`
        // `Abc[2]`   => `[Abc,Abc]`
        const matches = json.match(/^\w+\[\w+]$/g) ?? [];
        for (const match of matches) {
            const groups = match.match(/^(?<type>\w+)\[(?<size>\w+)]$/)?.groups;
            const {size, type} = groups;
            const {isNumber, staticSize} = this._getSize(size);
            if (isNumber) {
                const replacer = `[${Array(staticSize).fill(type).join(',')}]`;
                json = json.split(match).join(replacer);
            } else {
                throw Error(`Unsupported size "${size}".`);
            }
        }
        return json;
    }

    private static arrayOfItems2(json: string): string {
        // Static [itemType/size]
        // `[Abc/2]` `[Abc,Abc]`
        const matches = json.match(/\[\w+\/\w+]/g) ?? [];
        for (const match of matches) {
            const groups = match.match(/\[(?<type>\w+)\/(?<size>\w+)]/)?.groups;
            const {size, type} = groups;
            const {isNumber, staticSize} = this._getSize(size);
            if (isNumber) {
                const replacer = `[${Array(staticSize).fill(type).join(',')}]`;
                json = json.split(match).join(replacer);
            } else {
                throw Error(`Unsupported size "${size}".`);
            }
        }
        return json;
    }

    private static staticOrDynamicArray(json: string): string {
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
        const matches =
            json.match(/\w+:\w+\[\w+]/g) ??
            [];
        for (const match of matches) {
            const groups = match.match(/(?<key>\w+):?(?<type>\w+)\[(?<size>\w+)];?/)?.groups;
            const {key, size, type} = groups;
            this._checkSize(size);
            const replacer = `${key}.${size}:${type}`;
            json = json.split(match).join(replacer);
        }
        return json;
    }

    private static justArray(json: string): string {
        // Static
        // `s[2]`       => `s.2`
        // `string[2]`  => `s.2`
        // `Abc[2]`     => `Abc.2`
        // `buf[2]`     => `buf.2`
        // `buffer[2]`  => `buf.2`
        // `i16[2]`     => `i16.2`
        // Dynamic
        // `s[i8]`      => `s.i8`
        // `string[i8]` => `s.i8`
        // `Abc[i8]`    => `Abc.i8`
        // `buf[i8]`    => `buf.i8`
        // `buffer[i8]` => `buf.i8`
        // `i16[i8]`    => `i16.i8`
        const matches =
            json.match(/\w+\[\w+]/g) ??
            [];
        for (const match of matches) {
            const groups = match.match(/(?<type>\w+)\[(?<size>\w+)];?/)?.groups;
            const {type, size} = groups;
            this._checkSize(size);
            const replacer = `${type}.${size}`;
            json = json.split(match).join(replacer);
        }
        return json;
    }

    private static cKindFields(json: string): string {
        // `{u8 a,b;i32 x,y,z;}` => `{a:u8,b:u8,x:i32,y:i32,z:i32}`
        // `{Xyz x,y,z;}`       => `{x:Xyz,y:Xyz,z:Xyz}`
        const matches =
            json.match(/\w+\s[\w,]+;/g) ?? // match `u8 a,b;`
            [];
        for (const match of matches) {
            const groups = match.match(/(?<type>\w+)\s(?<fields>[\w,]+);/)?.groups;
            const {type, fields} = groups;
            const replacer = fields.split(',').map(field => `${field}:${type}`).join(',') + ',';
            json = json.split(match).join(replacer);
        }
        return json;
    }

    private static cKindStructs(json: string): string {
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
        const matches =
            json.match(/(typedef struct{[\w\s,:]+}\w+;|struct \w+{[\w\s,:]+};)/g) ??
            [];
        for (const match of matches) {
            const groups =
                match.match(/typedef struct{(?<fields>[\w\s,:]+)}(?<type>\w+);/)?.groups ??
                match.match(/struct (?<type>\w+){(?<fields>[\w\s,:]+)};/)?.groups;
            const {fields, type} = groups;
            const replacer = `${type}:{${fields}},`;
            json = json.split(match).join(replacer);
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

    private static replaceModelTypesWithUserTypes(json: string, types ?: Types): string {
        if (types) {
            // Parse user types
            const parsedTypesJson = this.parseTypes(types);
            const parsedTypes = JSON.parse(parsedTypesJson);

            // Prepare replacers
            const typeEntries: [string, string][] = Object
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

    static parseModel(model: Model, types ?: Types): string {
        if (!model) {
            throw Error(`Invalid model '${model ?? typeof model}'`);
        }

        let json = (typeof model) === 'string' ? model as string : JSON.stringify(model); // stringify
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