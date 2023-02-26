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

    private static _extractCKindFields(body: string, end = ''): string {
        return (body
                .match(/\w+\s[\w,]+;/g) ?? [])
                .map(m => m.match(/(?<type>\w+)\s(?<fields>[\w,]+);/))
                .map(({groups: {type, fields}}) => {
                    const keys = fields.split(',');
                    const pairs = keys.map(k => `${k}:${type}`);
                    return pairs.join(',');
                })
                .join(',')
            + end;
    }

    private static prepareJson(json: string): string {
        json = json.replace(/\/\/.*$/gm, ``); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.trim();
        json = json.replace(/['"]/g, ''); // remove all `'"`
        json = json.replace(/\s*([,:;{}[\]])\s*/g, `$1`); // remove spaces around `,:;{}[]`
        json = json.replace(/\s{2,}/g, ` `); // reduce ' 'x to one ' '

        return json;
    }

    private static dynamicStringOrArray(json: string): string {
        // {some s[i8]}      => {some.i8: s}
        // {some string[i8]} => {some.i8: s}
        // {some:s[i8]}      => {some.i8: s}
        // {some:string[i8]} => {some.i8: s}
        // {some Abc[i8]}    => {some.i8: Abc}
        // {some:Abc[i8]}    => {some.i8: Abc}
        const matches = json.match(/\w+:?\w+\[\w+\];?/g) ?? [];
        for (const match of matches) {
            const matchArray = match.match(/(?<key>\w+):?(?<type>\w+)\[(?<size>\w+)\];?/);
            json = this._translateStaticAndDynamic(json, match, matchArray);
        }
        return json;
    }

    private static staticArray(json: string): string {
        // `[3/u8]` => `[u8,u8,u8]`
        // `[3/s]`  => `s3`
        // `[3/string]`  => `s3`
        // TODO? `u8[3]` => `[u8,u8,u8]` ?
        // TODO?`u8[i8]` => `u8.i8` ?
        const matches = json.match(/\[\w+\/\w+\]/g) ?? [];
        for (const match of matches) {
            const m = match.match(/\[(?<size>\w+)\/(?<type>\w+)\]/);
            if (m?.length === 3) {
                const {size, type} = m.groups;
                const isNumber = this._checkWhetherSizeIsNumber(size);
                const typeIsString = this._checkWhetherTypeIsString(type);
                if (isNumber) {
                    if (+size < 0) {
                        throw Error(`Size must be >= 0.`)
                    }
                    let replacer: string;
                    if (typeIsString) {
                        replacer = `s${size}`;
                    } else {
                        replacer = `[${Array(+size).fill(type)}]`;
                    }
                    json = json.split(match).join(replacer);
                } else {
                    throw Error(`Size must be a number, '${size}'.`);
                }
            }
        }
        return json;
    }

    private static CKindStruct(json: string): string {
        // A)
        // struct  myStructA  {
        //     u8  one , a  ;
        //     u16  two , b  ;
        // }  ;
        // => `{"myStructA":{"one":"u8","a":"u8"}}`
        // B)
        // typedef  struct  {
        //     i8  three , c ;
        //     i16  four , d ;
        // }  myStructB  ;
        // => `{"myStructB":{"three":"i8","c":"i8"}}`
        // C)
        // myStructC {
        //     u8  a , b ;
        //     i16  c , d ;
        // } [;]
        // C options
        // myStructC{u8 a,b;i16 c,d;};
        // myStructC{u8 a,b;i16 c,d;}
        // myStructC:{u8 a,b;i16 c,d;};
        // myStructC:{u8 a,b;i16 c,d;}
        // => `{"myStructC":{"a":"u8","b":"u8","c":"i16","d":"i16"}}`
        const matches =
            json.match(/struct(\w+){(.*)};/g) ??
            json.match(/typedef\sstruct{(.*)}(\w+);/g) ??
            json.match(/(\w+){([\w ,;]+)};?/g) ??
            [];
        for (const match of matches) {
            const m =
                match.match(/struct\s(?<name>\w+){(?<body>.*)};/) ??
                match.match(/typedef\sstruct:{(?<body>.*)}(?<name>\w+);/) ??
                match.match(/(?<name>\w+):?{(?<body>[\w ,;]+)};?/);
            if (m?.length === 3) {
                const {name, body} = m.groups;
                const fields = this._extractCKindFields(body);
                if (fields) {
                    const replacer = `${name}:{${fields}}`;
                    json = json.split(match).join(replacer);
                }
            }
        }
        return json;
    }

    private static CKindFields(json: string): string {
        // `{u8 a,b,c;}` => `{a:u8,b:u8,c:u8}`
        const matches = json.match(/(\w+)\s([\w ,;]+);/g) ?? [];
        for (const match of matches) {
            const replacer = this._extractCKindFields(match, ',');
            if (replacer) {
                json = json.split(match).join(replacer);
            }
        }
        return json;
    }

    private static CKindStaticAndDynamicArrayOrString(json: string): string {
        // `{s Key[2]}` => `{Key:s2}`
        // `{s Key[u8]}` => `{Key.string:u8,Key:string}`
        // `{string Key[2]}` => `{Key:s2}`
        // `{string Key[u8]}` => `{Key.string:u8,Key:string}`
        // `{Type Key[2]}` => `{Key:[Type,Type]}`, n times
        // `{Type Key[u8]}` => `{Key.array:u8,Key:Type}`
        const matches = json.match(/\w+\s\w+:\[\w+\]/g) ?? [];
        for (const match of matches) {
            const matchArray = match.match(/(?<type>\w+)\s(?<key>\w+):\[(?<size>\w+)\]/);
            json = this._translateStaticAndDynamic(json, match, matchArray);
        }
        return json;
    }

    private static CKindStaticArrayOrString(json: string): string {
        // `u8 [3];` => `["u8","u8","u8"]`
        // `s [3];` => `s3`
        // `string [3];` => `s3`
        const matches = json.match(/\w+:\[[0-9]+\];?/g) ?? [];
        for (const match of matches) {
            const m = match.match(/(?<type>\w+):\[(?<size>[0-9]+)\];?/);
            if (m?.length === 3) {
                const {type, size} = m.groups;
                const isNumber = this._checkWhetherSizeIsNumber(size);
                if (isNumber) {
                    if (+size < 0) {
                        throw Error(`Size must be >= 0.`)
                    }
                    const typeIsString = this._checkWhetherTypeIsString(type);
                    const replacer = typeIsString ? `s${size}` : `[${Array(+size).fill(type)}]`;
                    json = json.split(match).join(replacer);
                } else {
                    throw Error(`Size must be a number.`);
                }
            }
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
        json = this.dynamicStringOrArray(json);
        json = this.staticArray(json);
        json = this.CKindStruct(json);
        json = this.CKindFields(json);
        json = this.CKindStaticAndDynamicArrayOrString(json);
        json = this.CKindStaticArrayOrString(json);
        json = this.clearJson(json);
        json = this.replaceModelTypesWithUserTypes(json, types);
        json = this.fixJson(json);

        return json;
    }
}
let obj;
let types;
let json;
let model;

json = `{A:{u8 a,b;};`;
json;//?
model = ModelParser.parseModel(json, types);