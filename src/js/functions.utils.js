/**
 * Converts a hexadecimal string to a Buffer.
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {Buffer} - The resulting Buffer.
 */
function hexToBuffer(hex) {
    hex = hex.replace(/0x/g, "");
    hex = hex.replace(/[\n _]/g, "");
    return Buffer.from(hex, "hex");
}

/**
 * Converts a Buffer to a hexadecimal string.
 * @param {Buffer} buffer - The Buffer to convert.
 * @returns {string} - The resulting hexadecimal string.
 */
function bufferToHex(buffer) {
    return buffer.toString("hex");
}

/**
 * Prints a Buffer as a hexadecimal string to the console.
 * @param {Buffer} buffer - The Buffer to print.
 */
function printBuffer(buffer) {
    console.log(buffer.toString("hex"));
}

module.exports = {
    hexToBuffer,
    bufferToHex,
    printBuffer
};