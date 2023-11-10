export function hexToBuffer(hex: string): Buffer {
    hex = hex.replace(/0x/g, "");
    hex = hex.replace(/[\n _]/g, "");
    return Buffer.from(hex, "hex");
}

export function bufferToHex(buffer: Buffer): string {
    return buffer.toString("hex");
}

export function printBuffer(buffer: Buffer): void {
    console.log(buffer.toString("hex"));
}