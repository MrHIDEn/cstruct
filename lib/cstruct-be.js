import { CStruct } from "./cstruct";
import { ReadBE } from "./read-be";
import { WriteBE } from "./write-be";
import { MakeBE } from "./make-be";
/**
 * C_Struct BE - Big Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStructBE extends CStruct {
    constructor(model, types) {
        super(model, types);
    }
    read(buffer, offset = 0) {
        const reader = new ReadBE(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct(),
            offset: reader.offset,
            size: reader.size,
        };
    }
    write(buffer, struct, offset = 0) {
        const writer = new WriteBE(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        };
    }
    make(struct) {
        const writer = new MakeBE(this.modelClone, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        };
    }
}
//# sourceMappingURL=cstruct-be.js.map