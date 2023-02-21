export function hexToBuffer(hex: string): Buffer {
    hex = hex.replace(/0x/g, "");
    hex = hex.replace(/ /g, "");
    hex = hex.replace(/\n/g, "");
    return Buffer.from(hex, "hex");
}