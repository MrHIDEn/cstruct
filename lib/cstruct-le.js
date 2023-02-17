import { CStruct } from "./cstruct";
import { ReadLE } from "./read-le";
import { WriteLE } from "./write-le";
import { MakeLE } from "./make-le";
/**
 * C_Struct LE - Little Endian
 * Binary/Object and vice versa parser for JavaScript
 *
 * Parse MODEL,
 * Parse TYPES,
 * Uses Object, JSON, C_Struct lang (kind of C)
 */
export class CStructLE extends CStruct {
    constructor(model, types) {
        super(model, types);
    }
    read(buffer, offset = 0) {
        const reader = new ReadLE(this.modelClone, buffer, offset);
        return {
            struct: reader.toStruct(),
            offset: reader.offset,
            size: reader.size,
        };
    }
    write(buffer, struct, offset = 0) {
        const writer = new WriteLE(this.modelClone, struct, buffer, offset);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        };
    }
    make(struct) {
        const writer = new MakeLE(this.modelClone, struct);
        return {
            buffer: writer.toBuffer(),
            offset: writer.offset,
            size: writer.size,
        };
    }
}
//# sourceMappingURL=cstruct-le.js.map