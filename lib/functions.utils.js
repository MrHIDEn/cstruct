export function hexToBuffer(hex) {
    hex = hex.replace(/0x/g, "");
    hex = hex.replace(/[\n _]/g, "");
    return Buffer.from(hex, "hex");
}
export function bufferToHex(buffer) {
    return buffer.toString("hex");
}
export function printBuffer(buffer) {
    console.log(buffer.toString("hex"));
}
//# sourceMappingURL=functions.utils.js.map