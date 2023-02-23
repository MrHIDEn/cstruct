export function hexToBuffer(hex) {
    hex = hex.replace(/0x/g, "");
    hex = hex.replace(/[\n _]/g, "");
    return Buffer.from(hex, "hex");
}
//# sourceMappingURL=hex-to-buffer.utils.js.map