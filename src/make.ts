import { Model, SpecialType, WriterValue } from "./types";
import { WriteBufferLE } from "./write-buffer-le";
import { WriteBufferBE } from "./write-buffer-be";
import { enumNameToRaw } from "./enum";
import { CompiledNode, CompiledDynamic, compiledModel } from "./compiled-model";
import { utf8Length } from "./uv/utf";

export class Make<T> {
    protected _writer: WriteBufferLE | WriteBufferBE;

    /**
     * Walk the (precompiled) model and struct value, writing bytes to the
     * internal buffer. The model is never mutated — only the output buffer grows.
     */
    recursion(model: Model, struct: T) {
        this.writeNode(compiledModel(model), struct);
    }

    private writeNode(node: CompiledNode, struct: any) {
        switch (node.t) {
            case 0: { // scalar
                if (node.buf0) {
                    throw new Error(`Buffer size can not be 0. (make)`);
                }
                let value: WriterValue = struct;
                if (node.json) {
                    value = JSON.stringify(value);
                }
                this._writer.write(node.type, value, node.size);
                return;
            }
            case 1: { // enum
                this._writer.write(node.type, enumNameToRaw(node.enumModel, struct));
                return;
            }
            case 2: { // dynamic
                this.writeDynamic(node, struct);
                return;
            }
            case 3: { // tuple model
                for (let i = 0; i < node.items.length; i++) {
                    this.writeNode(node.items[i], struct[i]);
                }
                return;
            }
            case 4: { // object model
                for (const field of node.fields) {
                    this.writeNode(field.node, struct[field.key]);
                }
                return;
            }
        }
    }

    private writeDynamic(node: CompiledDynamic, struct: any) {
        let structValues = struct;
        if (node.special === SpecialType.Json) {
            structValues = JSON.stringify(structValues);
        }

        if (node.isStatic && node.staticSize !== 0 && structValues.length > node.staticSize && node.special !== SpecialType.String) {
            throw new Error(`Size of value ${structValues.length} is greater than ${node.staticSize}.`);
        }

        const isUtf8 = node.special === SpecialType.String || node.special === SpecialType.Json;
        const size = node.isStatic
            ? node.staticSize
            : (isUtf8 ? utf8Length(structValues) : structValues.length);

        if (size === 0 && node.special === SpecialType.Buffer) {
            throw new Error(`Buffer size can not be 0.`);
        }

        // Dynamic length — write size prefix before the value
        if (!node.isStatic) {
            this._writer.write(node.lengthType, size);
        }

        // Write string, wstring, buffer, or json blob
        if (node.special) {
            this._writer.write(node.type, structValues, node.isStatic ? size : undefined);
        }
        // Write array of items
        else {
            const items = node.items!;
            for (const value of structValues) {
                this.writeNode(items, value);
            }
        }
    }

    toBuffer() {
        return this._writer.toBuffer();
    }

    get offset() {
        return this._writer.size;
    }

    get size() {
        return this._writer.size;
    }

    getBufferAndOffset() {
        return [this.toBuffer(), this.offset];
    }
}
