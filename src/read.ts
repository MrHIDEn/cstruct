import { ReadBufferBE } from "./read-buffer-be";
import { ReadBufferLE } from "./read-buffer-le";
import { Model, SpecialType, StructValue } from "./types";
import { enumRawToName } from "./enum";
import { CompiledNode, compiledModel } from "./compiled-model";


export class Read<T> {
    protected _struct: T;
    protected _reader: ReadBufferLE | ReadBufferBE;

    /**
     * Walk the (precompiled) model and build a fresh struct value.
     * The model is never mutated — the result is a new object/array tree.
     */
    readSchema(model: Model): StructValue {
        return this.readNode(compiledModel(model));
    }

    private readNode(node: CompiledNode): StructValue {
        switch (node.t) {
            case 0: { // scalar
                if (node.buf0) {
                    throw new Error(`Buffer size can not be 0. (read)`);
                }
                let value = this._reader.read(node.type, node.size);
                if (node.json) {
                    value = JSON.parse(value as string);
                }
                return value;
            }
            case 1: { // enum
                const raw = this._reader.read(node.type);
                return enumRawToName(node.enumModel, raw);
            }
            case 2: { // dynamic (string/wstring/buffer/json or array, length on the wire)
                const size = node.isStatic ? node.staticSize : this._reader.read(node.lengthType) as number;
                if (size === 0 && node.special === SpecialType.Buffer) {
                    throw new Error(`Buffer size can not be 0.`);
                }
                if (node.special) {
                    const value = this._reader.read(node.type, size);
                    return node.special === SpecialType.Json ? JSON.parse(value as string) : value;
                }
                const result: StructValue[] = [];
                const items = node.items!;
                for (let i = 0; i < size; i++) {
                    result[i] = this.readNode(items);
                }
                return result;
            }
            case 3: { // tuple model
                const result: StructValue[] = [];
                for (let i = 0; i < node.items.length; i++) {
                    result[i] = this.readNode(node.items[i]);
                }
                return result;
            }
            case 4: { // object model
                const result: Record<string, StructValue> = {};
                for (const field of node.fields) {
                    result[field.key] = this.readNode(field.node);
                }
                return result;
            }
        }
        throw new TypeError(`Unknown compiled node`);
    }

    toStruct(): T {
        return this._struct;
    }

    get size() {
        return this._reader.size;
    }

    get offset() {
        return this._reader.offset;
    }
}
