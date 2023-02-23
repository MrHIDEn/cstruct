import { Model, Types } from "../src/types";

export class ModelParser {
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
        json = json.replace(/(\w+)({.*?}|\[.*?\])/g, `$1:$2`); // add missing `:` between key and { or [
        json;//?

        return json;
    }

    private static dynamicStringOrArray(json: string): string {
        // S1) string / s, <key>:[<static-size>/string], static-size is number
        //  `a:[3/s]` => `{a:s<static-size>}`
        //  `a:[3/string]` => `{a:s<static-size>}`
        // S2) string, <key>:[<dynamic-size>/string], dynamic-size is type string (u8, ect)
        //  `a:[u8/s]` => `{a.string:u8,a:string}`
        //  `a:[u8/string]` => `{a.string:u8,a:string}`
        // A1) array, <key>:[<static-size>/<type>], static-size is number
        //  `a:[3/u8]` => a:[u8,u8,u8]
        // A2) array, <key>:[<dynamic-size>/<type>], dynamic-size is type string (u8, ect)
        //  `a:[u8/u8]` => {a.string:u8,a:u8}
        const matches = json.match(/\w+:?\[\w+\/\w+\];?/g) ?? [];
        for (const match of matches) {
            const m = match.match(/(?<key>\w+):?\[(?<size>\w+)\/(?<type>\w+)\];?/);
            if (m?.length === 4) {
                const { key, size, type } = m.groups;
                const typeIsString = ["string","s"].includes(type);
                const isSize = !Number.isNaN(+size); // or is type string

                let replacer: string;
                // string
                if (typeIsString) {
                    if (isSize) {
                        replacer = `${key}:s${size}`; // static string
                    } else {
                        replacer = `${key}.string:${size},${key}:string`; // dynamic string
                    }
                }
                // array
                else {
                    if (isSize) {
                        replacer = `${key}:[${Array(+size).fill(type)}]`; // static array
                    } else {
                        replacer = `${key}.array:${size},${key}:${type}`; // dynamic array
                    }
                }

                json = json.split(match).join(replacer);
            }
        }
        return json;
    }

    private static staticArray(json: string): string {
        // `[<size>/<type>]` => `[<type>,<type>,<type>,...]`
        // `[3/u8]` => `[u8,u8,u8]`
        const matches = json.match(/\[\w+\/\w+\]/g) ?? [];
        for (const match of matches) {
            const m = match.match(/\[(?<n>\w+)\/(?<type>\w+)\]/);
            if (m?.length === 3) {
                const { n, type } = m.groups;
                const isSize = !Number.isNaN(+n);
                const size = +n;
                if (isSize && size >= 0) {
                    const replacer = `[${Array(size).fill(type)}]`;
                    json = json.split(match).join(replacer);
                } else {
                    throw Error(`Syntax error, ${n}`);
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
        // myStructC [:] {
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
            json.match(/struct\s(\w+):{(.*)};/g) ??
            json.match(/typedef\s+struct:{(.*)}(\w+);/g) ??
            json.match(/(\w+):?{([\w ,;]+)};?/g) ??
            [];
        for (const match of matches) {
            const m =
                match.match(/struct\s+(?<name>\w+)\s*{\s*(?<body>.*)}\s*;/) ??
                match.match(/typedef\s+struct:{(?<body>.*)}(?<name>\w+);/) ??
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
        json;//?
        return json;
    }

    private static CKindFields(json: string): string {
        // `{u8 a,b,c;}`
        // => `{a:u8,b:u8,c:u8}`
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
        // `{Type Key[2]}` => `{Key:[Type,Type]}`, n times
        // `{Type Key[u8]}` => `{Key.array:u8,Key:Type}`
        // `{s Key[2]}` => `{Key:s2}`
        // `{s Key[u8]}` => `{Key.string:u8,Key:string}`
        // `{string Key[2]}` => `{Key:s2}`
        // `{string Key[u8]}` => `{Key.string:u8,Key:string}`
        const matches = json.match(/\w+\s\w+:\[\w+\]/g) ?? [];
        for (const match of matches) {
            const m = match.match(/(?<type>\w+)\s(?<key>\w+):\[(?<size>\w+)\]/);
            if (m?.length === 4) {
                const { type, key, size } = m.groups;
                const typeIsString = ["string","s"].includes(type);
                const isSize = !Number.isNaN(+size); // number or type string

                let replacer: string;
                // <key.string>
                if (typeIsString) {
                    if (isSize) {
                        replacer = `${key}:s${size}`;
                    } else {
                        replacer = `${key}.string:${size},${key}:string`;
                    }
                }
                // <key.array>
                else {
                    if (isSize) {
                        replacer = `${key}:[${Array(+size).fill(type)}]`;
                    } else {
                        replacer = `${key}.array:${size},${key}:${type}`;
                    }
                }

                json = json.split(match).join(replacer);
            }
        }
        return json;
    }

    private static CKindStaticArrayOrString(json: string): string {
        // Special-5
        // Special-2
        // `u8 [3];` => `["u8","u8","u8"]`
        // `s [3];` => `s3`
        // `string [3];` => `s3`
        json;//?
        const matches = json.match(/\w+:\[[0-9]+\];?/g) ?? [];
        for (const match of matches) {
            const m = match.match(/(?<type>\w+):\[(?<body>[0-9]+)\];?/);
            if (m?.length === 3) {
                const { type, body } = m.groups;
                const isSize = !Number.isNaN(+body);
                const size = +body;
                if (isSize && size >= 0) {
                    const typeIsString = ["string","s"].includes(type);
                    const replacer = typeIsString ? `s${body}` : `[${Array(size).fill(type)}]`;
                    json = json.split(match).join(replacer);
                } else {
                    throw Error(`Syntax error '${body}'`);
                }
            }
        }
        return json;
    }

    private static clearJson(json: string): string {
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','
        json = json.replace(/(.*),$/, '$1'); // remove last ','
        json = json.replace(/([}\]])\s*([{[\w])/g, '$1,$2'); // add missing ',' between }] and {[
        json = json.replace(/([_a-zA-Z]\w*\.?\w*)/g, '"$1"'); // Add missing ""
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
        json;//?

        json = this.dynamicStringOrArray(json);
        json;//?

        json = this.staticArray(json);
        json;//?

        json = this.CKindStruct(json);
        json;//?

        json = this.CKindFields(json);
        json;//?

        json = this.CKindStaticAndDynamicArrayOrString(json);
        json;//?

        json = this.CKindStaticArrayOrString(json);
        json;//?

        json = this.clearJson(json);
        json;//?

        json = this.replaceModelTypesWithUserTypes(json, types);
        json;//?

        json = this.fixJson(json);
        json;//?

        return json;
    }
}
let types;
let json = `
        // struct  myStructA  {
        //     u8  one , a  ;
        //     u16  two , b  ;
        // }  ;   
        //
        // typedef  struct  {
        //     i8  three , c ;
        //     i16  four , d ;
        // }  myStructB  ; 
        
        // myStructC  {
        //     u8  a , b ;
        //     i16  c , d ;
        // } 
        // myStructD : {
        //     u8  a , b ;
        //     i16  c , d ;
        // } 
        // myStructE  {
        //     u8  a , b ;
        //     i16  c , d ;
        // } ; 
        // myStructF : {
        //     u8  a , b ;
        //     i16  c , d ;
        // } ;
        
        // Special2
        // u8 a,b, c, d;
        
        // Type Key[2]
        // Type Key[u8]
        // string Key[2]
        // string Key[u8]
        // s Key[2]
        // s Key[u8]
        
        // u8[3];
        // u8 [3];
        // string [3];
        // s [3];
        // {
        //     a: u8 [3],
        //     b: u8 [3],
        // }
        
        // {a[3/s]}
        // {a[3/string]}
        // {a[3/u8]}
        // {a[u8/u8]}
        
        // [3/u8]
        
        // { abc: [f/f] } +
        // {str:[f/string]} +
        // {a:u8,b:u16,c:u32} +
        // {a[3/u8]} +
        // {u8 a,b;} +
        
        {
            u8 a;
            u16 b,c;
            d[2/u8];
            e:{f:u64}
        }
        
        // {u8 a,b,c;}
        
        // { 
        //     A {u8 aa; } 
        //     B {u16 bb;} 
        //     C [2/u64] ;
        // }
`;
json = `{
    u8 a;
    u16 b,c;
    d[2/u8];
    e{f:u64}
}`;
json = `{
    struct  myStructA  {
        u8  a , b  ;
        u16  c , d  ;
    }  ;
}`;
json = `{
typedef  struct  {
    u8  a , b  ;
    u16  c , d  ;
}  myStructB  ;
}`;
json = `{
    myStructC  {
        u8  a , b ;
        i16  c , d ;
    } ;
}`;
json = `{
    Type Key[2]
}`;
json = `u8 [3];`;
json = `s [3];`;
json = `string [3];`;
json = `[2/Sensor]`;
json = `{sensors: [2/Sensor]}`;
types = `{Sensor: {type: u8, value: f, time: u64 }}`;
// json = `{ A {u8 aa; }; B {u16 bb;}; C [2/u64] }`;
// json = `{ abc: [f/f] }`;
json;//?
// json = (ModelParser as any).prepareJson(json);//?
// json;//?
// const matches = json.match(/(\w+)\s(\w+):\[(\w+)\]/g);
// matches;//?
const model = ModelParser.parseModel(json, types);
model;//?
JSON.parse(model);//?
// json = `
// myStructC  {
//            u8  a , b ;
//            i16  c , d ;
//         }  ;
// `;
// json = `
// myStructC : {
//            u8  a , b ;
//            i16  c , d ;
//         }  ;
// `;
// json = `
// myStructC  {
//            u8  a , b ;
//            i16  c , d ;
//         }
// `;
// json = `
// myStructC : {
//            u8  a , b ;
//            i16  c , d ;
//         }
// `;
