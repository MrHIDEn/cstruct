export function hexToBuffer(hex: string): Buffer {
    hex = hex.replace(/0x/g, "");
    hex = hex.replace(/[\n _]/g, "");
    return Buffer.from(hex, "hex");
}

export function bufferToHex(buffer: Buffer): string {
    return buffer.toString("hex");
}

export function printBuffer(buffer: Buffer): string {
    const hex = buffer.toString("hex");
    console.log(hex);
    return hex;
}

export function removeNonHex(dirtyHex: string) {
    return dirtyHex
        // Replace kind of formatting, label:HEX -> HEX
        // "(Ab.length:03) (Ab:[])[{a:01,b:02},{a:03,b:04},{a:05,b:06}]" -> "(03) ([])[{01,02},{03,04},{05,06}]"
        // "(Ab:[03])[{a:01,b:02},{a:03,b:04},{a:05,b:06}]" -> "([03])[{01,02},{03,04},{05,06}]"
        .replace(/[\w.]+?:/g, '')
        // Replace all non-HEX characters
        // "(03) ([])[{01,02},{03,04},{05,06}]" -> "03010203040506"
        // "([03])[{01,02},{03,04},{05,06}]" -> "03010203040506"
        // "12 34 5678 90ab cdef ghijk klmn oprs tquw xyzw !@#$ %^&* ()[]{}<>" -> "1234567890abcdef"
        .replace(/[^0-9a-fA-F]/g, '');
}

export function hexToBufferEx(dirtyHex: string): Buffer {
    const hex = removeNonHex(dirtyHex);
    return Buffer.from(hex, "hex");
}