import { Model, Types, TypesEntries } from "./types";

export class ModelParser {
    private static _prepareJson(json: string): string {
        json = json.replace(/\/\/.*$/gm, ``); // remove comments
        json = json.replace(/^\s+$/m, ``); // remove empty lines
        json = json.replace(/\s{2,}/g, ` `); // reduce ' ' to one ' '
        json = json.replace(/\n/g, ``); // remove line breaks
        json = json.replace(/\s*,\s*/g, `,`); //x remove spaces before/after ,
        json = json.replace(/\s*([}\]])\s*;?\s*/g, `$1`); // remove ending ';' for '}' or ']' and trim ' ' on start and ' '
        json = json.replace(/([{[])\s*(\w)/g, `$1$2`); // remove 'spaces' after '{' or '['
        json = json.replace(/([}\]])\s*(\w+)/g, `$1,$2`); // add , between keys
        json = json.replace(/([\w0-9])\s*:?\s*([{[])/g, `$1:$2`); // add missing : between key and { or [ and remove ' ' around :
        json = json.replace(/\s*:\s*/g, ':'); // remove spaces around :
        return json.replace(/"/g, ''); // remove all "
    }

    private static _dynamicArrayOrString1(json: string): string {
        // Special
        // `{Type Key[2]}` => `{Key:[Type,Type]}`, n times
        // `{Type Key[u8]}` => `{Key.array:u8,Key:Type}`
        // `{string Key[2]}` => `{Key:s2}`
        // `{string Key[u8]}` => `{Key.string:u8,Key:string}`
        const matches = (json.match(/\w+ \w+:\[\w+\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/(\w+) (\w+):\[(\w+)\]/);
            if (m !== null && m.length === 4) {
                let j: string;
                const [, t, k, n] = m;
                const isString = t === "string";
                const isNumber = !Number.isNaN(+n);

                // <key.string>
                if (isString) {
                    if (isNumber) {
                        j = `${k}:s${n}`;
                    } else {
                        j = `${k}.string:${n},${k}:${t}`;
                    }
                }
                // <key.array>
                else {
                    if (isNumber) {
                        j = `${k}:[${Array(+n).fill(t)}]`;
                    } else {
                        j = `${k}.array:${n},${k}:${t}`;
                    }
                }

                json = json.split(match).join(j);
            }
        }
        return json;
    }

    private static _staticArrayOrString(json: string): string {
        // Special
        // from: `u8 [3];`
        // to: `["u8","u8","u8"]`
        // from: `string [3];`
        // to: `s3`
        const matches = (json.match(/\w+:\[\w+\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/(\w+):\[(\w+)\]/);
            if (m !== null && m.length === 3) {
                const [, t, n] = m;
                const isNumber = !Number.isNaN(+n);
                if (!isNumber) throw Error(`Syntax error '${match}'`);
                const isString = t === "string";
                const j = isString ? `s${n}` : `[${Array(+n).fill(t)}]`;
                json = json.split(match).join(j);
            }
        }
        return json;
    }

    private static _staticOrDynamicArrayOrString2(json: string): string {
        // Special: a[u8/u8],a[3/u8],a[u8/string],a[3/string]
        // A) array, <k>:[<n>/<t>], k-key, n-size, t-type
        // A1 <k>:[<t>, ...], when <n> is number
        // A2 <k>.array:<s>,<k>:<t>, when <n> is string (u8, ect)
        // S) string, <k>:[<s>/string], k-key, n-size, string
        // S1 <k>:s<n>, when <n> is number
        // S2 <k>.string:u8,<k>:string, when <n> is string (u8, ect)
        const matches = (json.match(/\w+:\[\w+\/\w+=?\w*\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/(\w+):\[(\w+)\/(\w+)\]/);
            if (m !== null && m.length === 4) {
                let j: string;
                const [, k, n, t] = m;
                const isString = t === "string";
                const isNumber = !Number.isNaN(+n);

                // string
                if (isString) {
                    if (isNumber) {
                        j = `${k}:s${n}`; // static string
                    } else {
                        j = `${k}.string:${n},${k}:${t}`; // dynamic string
                    }
                }
                // array
                else {
                    if (isNumber) {
                        j = `${k}:[${Array(+n).fill(t)}]`; // static array
                    } else {
                        j = `${k}.array:${n},${k}:${t}`; // dynamic array
                    }
                }

                json = json.split(match).join(j);
            }
        }
        return json;
    }

    private static _staticArray2(json: string): string {
        // from: [<n>/<t>], n-size, t-type
        // to: [<t>, <t>, ...]
        const matches = (json.match(/\[\w+\/\w+=?\w*\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/\[(\w+)\/(\w+)\]/);
            if (m !== null && m.length === 3) {
                const [, n, t] = m;
                const isNumber = !Number.isNaN(+n);
                const size = +n;
                if (isNumber && size >= 0) {
                    const j = `[${Array(size).fill(t)}]`;
                    json = json.split(match).join(j);
                } else {
                    throw Error("Syntax error");
                }
            }
        }
        return json;
    }

    private static _bracketCStyle(json: string): string {
        // from: `{<t> <v1>,<v2>,...}`
        // to: `{<v1>:<t>,<v2>:<t>,...}`
        const matches = (json.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) ?? []);
        for (const match of matches) {
            const m = match.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
            if (m !== null && m.length === 3) {
                const [, t, r] = m;
                const j = `{${r.split(/\s*,\s*/).map(k => `${k}:${t}`).join()}}`;
                json = json.split(match).join(j);
            }
        }
        return json;
    }

    private static _bracketLessCStyle(json: string): string {
        // from: `<t> <v1>,<v2>,...`
        // to: `{<v1>:<t>,<v2>:<t>,...}`
        const matches = (json.match(/([_a-zA-Z]\w*)\s+([\w0-9,]+);/g) ?? []);
        for (const match of matches) {
            const m = match.match(/([_a-zA-Z]\w*)\s*(.*);/);
            if (m !== null && m.length === 3) {
                const [, t, r] = m;
                const j = `${r.split(/\s*,\s*/).map(k => `${k}:${t},`).join('')}`;
                json = json.split(match).join(j);
            }
        }
        return json;
    }

    private static _clearJson(json: string): string {
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','
        json = json.replace(/([}\]])\s*([{[\w])/g, '$1,$2'); // add missing ',' between }] and {[
        json = json.replace(/([_a-zA-Z]\w*\.?\w*)/g, '"$1"'); // Add missing ""
        return json;
    }

    private static _replaceModelTypesWithUserTypes(json: string, types?: Types): string {
        if (types) {
            types = this.parseTypes(types);
            const typeEntries: [string, string][] = Object.entries(types);
            // Replace model with user types, stage 1
            typeEntries.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));
            // Reverse user types to replace nested user types
            typeEntries.reverse();
            // Replace model with reverse user types, stage 2
            typeEntries.forEach(([k, v]) => json = json.split(`"${k}"`).join(JSON.stringify(v)));

        }
        return json;
    }

    private static _fixJson(json: string): string {
        try {
            const model = JSON.parse(json);
            return JSON.stringify(model); // return fixed json
        } catch (error) {
            throw Error(`Syntax error '${json}'`);
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
        json = this._prepareJson(json);
        json = this._dynamicArrayOrString1(json);
        json = this._staticArrayOrString(json);
        json = this._staticOrDynamicArrayOrString2(json);
        json = this._staticArray2(json);
        json = this._bracketCStyle(json);
        json = this._bracketLessCStyle(json);
        json = this._clearJson(json);
        json = this._replaceModelTypesWithUserTypes(json, types);
        json = this._fixJson(json);

        return json;
    }
}