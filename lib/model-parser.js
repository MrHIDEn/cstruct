export class ModelParser {
    static _prepareJson(json) {
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
        json = json.replace(/"/g, ''); // remove all "
        json = json.replace(/'(\w+)'/g, `$1`); // replace all 'content' to content
        return json;
    }
    static _special1CKindDynamicArrayOrString1(json) {
        // Special-1
        // `{Type Key[2]}` => `{Key:[Type,Type]}`, n times
        // `{Type Key[u8]}` => `{Key.array:u8,Key:Type}`
        // `{string Key[2]}` => `{Key:s2}`
        // `{string Key[u8]}` => `{Key.string:u8,Key:string}`
        const matches = (json.match(/\w+ \w+:\[\w+\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/(\w+) (\w+):\[(\w+)\]/);
            if (m !== null && m.length === 4) {
                let j;
                const [, t, k, n] = m;
                const typeIsString = t === "string";
                const isSize = !Number.isNaN(+n); // or type string
                // <key.string>
                if (typeIsString) {
                    if (isSize) {
                        j = `${k}:s${n}`;
                    }
                    else {
                        j = `${k}.string:${n},${k}:${t}`;
                    }
                }
                // <key.array>
                else {
                    if (isSize) {
                        j = `${k}:[${Array(+n).fill(t)}]`;
                    }
                    else {
                        j = `${k}.array:${n},${k}:${t}`;
                    }
                }
                json = json.split(match).join(j);
            }
        }
        return json;
    }
    static _special2CKindArrayOrString(json) {
        // Special-2
        // `u8 [3];` => `["u8","u8","u8"]`
        // `string [3];` => `s3`
        const matches = (json.match(/\w+:\[\w+\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/(\w+):\[(\w+)\]/);
            if (m !== null && m.length === 3) {
                const [, t, n] = m;
                const isSize = !Number.isNaN(+n);
                const size = +n;
                if (isSize && size >= 0) {
                    const typeIsString = t === "string";
                    const j = typeIsString ? `s${n}` : `[${Array(size).fill(t)}]`;
                    json = json.split(match).join(j);
                }
                else {
                    throw Error(`Syntax error '${n}'`);
                }
            }
        }
        return json;
    }
    static _special3DynamicStringOrArray(json) {
        // Special-3
        // S) string, <k>:[<s>/string], k-key, n-size, string
        // a[3/string], a[u8/string]
        // => S1 <k>:s<n>, when <n> is number
        // => S2 <k>.string:u8,<k>:string, when <n> is type string (u8, ect)
        // A) array, <k>:[<n>/<t>], k-key, n-size, t-type
        // a[3/u8], a[u8/u8]
        // => A1 <k>:[<t>, ...], when <n> is number
        // => A2 <k>.array:<s>,<k>:<t>, when <n> is type string (u8, ect)
        const matches = (json.match(/\w+:\[\w+\/\w+=?\w*\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/(\w+):\[(\w+)\/(\w+)\]/);
            if (m !== null && m.length === 4) {
                let j;
                const [, k, n, t] = m;
                const typeIsString = t === "string";
                const isSize = !Number.isNaN(+n); // or is type string
                // string
                if (typeIsString) {
                    if (isSize) {
                        j = `${k}:s${n}`; // static string
                    }
                    else {
                        j = `${k}.string:${n},${k}:${t}`; // dynamic string
                    }
                }
                // array
                else {
                    if (isSize) {
                        j = `${k}:[${Array(+n).fill(t)}]`; // static array
                    }
                    else {
                        j = `${k}.array:${n},${k}:${t}`; // dynamic array
                    }
                }
                json = json.split(match).join(j);
            }
        }
        return json;
    }
    static _special4StaticArray2(json) {
        // Special-4
        // `[<n>/<t>]` n-size, t-type
        // => `[<t>, <t>, ...]`
        const matches = (json.match(/\[\w+\/\w+=?\w*\]/g) ?? []);
        for (const match of matches) {
            const m = match.match(/\[(\w+)\/(\w+)\]/);
            if (m !== null && m.length === 3) {
                const [, n, t] = m;
                const isSize = !Number.isNaN(+n);
                const size = +n;
                if (isSize && size >= 0) {
                    const j = `[${Array(size).fill(t)}]`;
                    json = json.split(match).join(j);
                }
                else {
                    throw Error(`Syntax error, ${n}`);
                }
            }
        }
        return json;
    }
    static _special5CKindBracketNess(json) {
        // Special-5
        // `{<t> <v1>,<v2>,...;}`
        // => `{<v1>:<t>,<v2>:<t>,...}`
        const matches = (json.match(/{([_a-zA-Z]\w*)\s+([\w0-9,]+);}/g) ?? []);
        matches.forEach((match, idx) => {
            const m = match.match(/{([_a-zA-Z]\w*)\s*(.*);}/);
            if (m !== null && m.length === 3) {
                const [, t, r] = m;
                const keys = r.split(/\s*,\s*/);
                const pairs = keys.map(k => `${k}:${t},`);
                const j = pairs.join('');
                json = json.split(match).join(`{${j}}`);
            }
        });
        return json;
    }
    static _special6CKindBracketLess(json) {
        // Special-6
        // `<t> <v1>,<v2>,...;`
        // => `{<v1>:<t>,<v2>:<t>,...}`
        const matches = (json.match(/\s*([_a-zA-Z]\w*)\s+([\w0-9,]+);/g) ?? []);
        matches.forEach((match, idx) => {
            const m = match.match(/\s*([_a-zA-Z]\w*)\s*(.*);/);
            if (m !== null && m.length === 3) {
                const [, t, r] = m;
                const keys = r.split(/\s*,\s*/);
                const pairs = keys.map(k => `${k}:${t},`);
                const j = pairs.join('');
                json = json.split(match).join(j);
            }
        });
        if (json.endsWith(',')) {
            json = json.slice(0, json.length - 1);
        }
        return json;
    }
    static _clearJson(json) {
        json = json.replace(/,([}\]])/g, '$1'); // remove last useless ','
        json = json.replace(/([}\]])\s*([{[\w])/g, '$1,$2'); // add missing ',' between }] and {[
        json = json.replace(/([_a-zA-Z]\w*\.?\w*)/g, '"$1"'); // Add missing ""
        return json;
    }
    static _replaceModelTypesWithUserTypes(json, types) {
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
    static _fixJson(json) {
        try {
            // Clean json
            const model = JSON.parse(json);
            return JSON.stringify(model);
        }
        catch {
            try {
                // Try to fix json
                const model = JSON.parse(`{${json}}`);
                return JSON.stringify(model);
            }
            catch (error) {
                throw Error(`Syntax error '${json}'`);
            }
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
        json = this._prepareJson(json);
        json = this._special1CKindDynamicArrayOrString1(json);
        json = this._special2CKindArrayOrString(json);
        json = this._special3DynamicStringOrArray(json);
        json = this._special4StaticArray2(json);
        json = this._special5CKindBracketNess(json);
        json = this._special6CKindBracketLess(json);
        json = this._clearJson(json);
        json = this._replaceModelTypesWithUserTypes(json, types);
        json = this._fixJson(json);
        return json;
    }
}
//# sourceMappingURL=model-parser.js.map