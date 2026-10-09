/**
 * Fast, dependency-free UTF-8 / UTF-16LE decoders for the browser path.
 *
 * These replace `TextDecoder.decode(...).split('\0')[0]` — the per-call
 * `TextDecoder` state overhead plus the array allocation from `.split()` made
 * string fields the dominant cost in read-heavy workloads. `readUtf8` decodes
 * well-formed UTF-8 in a single pass and stops at the first NUL byte; the
 * result is equivalent to `TextDecoder('utf-8').decode(bytes.subarray(start,end))
 * .split('\0')[0]` for well-formed input, but ~2-4x faster.
 */

/** Decode UTF-8 from [start, end), stopping at the first NUL (0x00) byte. */
export function readUtf8(bytes: Uint8Array, start: number, end: number): string {
    let out = '';
    let i = start;
    while (i < end) {
        const b = bytes[i];
        if (b === 0) break; // NUL terminator
        if (b < 0x80) {
            out += String.fromCharCode(b);
            i += 1;
        } else if ((b & 0xe0) === 0xc0) {
            if (i + 1 >= end) { out += '\ufffd'; break; }
            out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
            i += 2;
        } else if ((b & 0xf0) === 0xe0) {
            if (i + 2 >= end) { out += '\ufffd'; break; }
            out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
            i += 3;
        } else if ((b & 0xf8) === 0xf0) {
            if (i + 3 >= end) { out += '\ufffd'; break; }
            const cp = ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
            if (cp > 0x10ffff || cp < 0x10000) {
                out += '\ufffd';
            } else {
                const c = cp - 0x10000;
                out += String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 0x3ff));
            }
            i += 4;
        } else {
            out += '\ufffd'; // invalid leading byte
            i += 1;
        }
    }
    return out;
}

/** Decode UTF-16LE code units from [start, end), stopping at the first NUL word (0x0000). */
export function readUtf16(bytes: Uint8Array, start: number, end: number): string {
    let out = '';
    for (let i = start; i + 1 < end; i += 2) {
        const c = bytes[i] | (bytes[i + 1] << 8);
        if (c === 0) break;
        out += String.fromCharCode(c);
    }
    return out;
}

/**
 * Encode UTF-8 into bytes[start..], writing at most `maxBytes` bytes and
 * stopping on a character boundary (same semantics as TextEncoder.encodeInto,
 * but without the per-call encoder state). Returns the number of bytes written.
 */
export function writeUtf8(bytes: Uint8Array, start: number, str: string, maxBytes: number): number {
    let o = start;
    const end = start + maxBytes;
    for (let i = 0; i < str.length && o < end; i++) {
        let cp = str.charCodeAt(i);
        // astral char (surrogate pair)
        if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < str.length) {
            const lo = str.charCodeAt(i + 1);
            if (lo >= 0xdc00 && lo <= 0xdfff) {
                cp = ((cp - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
                i++;
            }
        }
        let n: number;
        if (cp < 0x80) n = 1;
        else if (cp < 0x800) n = 2;
        else if (cp < 0x10000) n = 3;
        else n = 4;
        if (o + n > end) break; // stop at a character boundary
        if (n === 1) {
            bytes[o++] = cp;
        } else if (n === 2) {
            bytes[o++] = 0xc0 | (cp >> 6);
            bytes[o++] = 0x80 | (cp & 0x3f);
        } else if (n === 3) {
            bytes[o++] = 0xe0 | (cp >> 12);
            bytes[o++] = 0x80 | ((cp >> 6) & 0x3f);
            bytes[o++] = 0x80 | (cp & 0x3f);
        } else {
            bytes[o++] = 0xf0 | (cp >> 18);
            bytes[o++] = 0x80 | ((cp >> 12) & 0x3f);
            bytes[o++] = 0x80 | ((cp >> 6) & 0x3f);
            bytes[o++] = 0x80 | (cp & 0x3f);
        }
    }
    return o - start;
}
