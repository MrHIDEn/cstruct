const {
    PRE_ALLOC_SIZE,
    parseStruct,
    readBufferLe,
} = require('../index');

test('PRE_ALLOC_SIZE', () => {
    expect(PRE_ALLOC_SIZE).toBe(200);
});

test('parseStruct', () => {
    //parseStruct(struct, uTypes = {}, { protect = false } = {})
    let s, t, r, x;

    [s, x] = [
        { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' },
        { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' }
    ];
    expect(JSON.stringify(r = parseStruct(s))).toBe(JSON.stringify(x));
    expect(r).toBe(s);

    [s, t, x] = [
        { p: 'XYZ' },
        { XYZ: { x: 'd', y: 'd', z: 'd' } },
        { p: { x: 'd', y: 'd', z: 'd' } }
    ];
    expect(JSON.stringify(r = parseStruct(s, t))).toBe(JSON.stringify(x));
    expect(r).toBe(s);

    [s, t, x] = [
        ['XYZ', 'XYZ'],
        { XYZ: { x: 'd', y: 'd', z: 'd' } },
        [{ x: 'd', y: 'd', z: 'd' }, { x: 'd', y: 'd', z: 'd' }]
    ];
    expect(JSON.stringify(r = parseStruct(s, t))).toBe(JSON.stringify(x));
    expect(r).toBe(s);

    [s, t, x] = [
        { 'a.length': 'u16', a: 'XYZ' },
        { XYZ: { x: 'd', y: 'd', z: 'd' } },
        { 'a.length': 'u16', a: { x: 'd', y: 'd', z: 'd' } }
    ];
    expect(JSON.stringify(r = parseStruct(s, t))).toBe(JSON.stringify(x));
    expect(r).toBe(s);

    [s, t, x] = [
        { g: '2D' },
        { '2D': { x: 'f', y: 'f' } },
        { g: { x: 'f', y: 'f' } },
    ];
    expect(JSON.stringify(r = parseStruct(s, t))).toBe(JSON.stringify(x));
    expect(r).toBe(s);

    [s, t, x] = [
        { g: '2D' },
        { '2D': { x: 'f', y: 'f' } },
        { g: { x: 'f', y: 'f' } },
    ];
    expect(JSON.stringify(r = parseStruct(s, t, { protect: false }))).toBe(JSON.stringify(x));
    expect(r).toBe(s);

    [s, t, x] = [
        { g: '2D' },
        { '2D': { x: 'f', y: 'f' } },
        { g: { x: 'f', y: 'f' } },
    ];
    expect(JSON.stringify(r = parseStruct(s, t, { protect: true }))).toBe(JSON.stringify(x));
    expect(r).not.toBe(s);
    expect(JSON.stringify(s)).toBe(JSON.stringify({ g: '2D' }));

});


test('readBufferLe', () => {
    //readBufferLe(buffer, struct, { protect = false, position = 0 } = {})
    let h, b, s, t, r, x;

    [h, s, x] = [
        //11 12   13       -11 -12  -13      21       22               a b c \0\0
        ' 0b 0c00 0d000000 f5  f4ff f3ffffff 0000a841 0000000000003640 6162630000'.replace(/ /g, ''),
        { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' },
        [{ a: 11, b: 12, c: 13, d: -11, e: -12, f: -13, g: 21, h: 22, i: 'abc' }, 31]
    ];
    b = Buffer.from(h, 'hex');
    expect(JSON.stringify(r = readBufferLe(b, s))).toBe(JSON.stringify(x));
    expect(r[0]).toBe(s);
    expect(r[1]).toBe(h.length / 2);

    [h, s, x] = [
        //11 12   13      
        ' 0b 0c00 0d000000 0000a841'.replace(/ /g, ''),
        ['u8', 'u16', 'u32', 'f'],
        [[11, 12, 13, 21], 11]
    ];
    b = Buffer.from(h, 'hex');
    expect(JSON.stringify(r = readBufferLe(b, s))).toBe(JSON.stringify(x));
    expect(r[0]).toBe(s);
    expect(r[1]).toBe(h.length / 2);

    [h, s, t, x] = [
        //11   12   13  
        ' 0b00 0c00 0d00'.replace(/ /g, ''),
        { a: 'XYZ' },
        { XYZ: { x: 'u16', y: 'u16', z: 'u16' } },
        [{ a: { x: 11, y: 12, z: 13 } }, 6]
    ];
    b = Buffer.from(h, 'hex');
    expect(JSON.stringify(r = readBufferLe(b, parseStruct(s, t)))).toBe(JSON.stringify(x));
    expect(r[0]).toBe(s);
    expect(r[1]).toBe(h.length / 2);

    [h, s, t, x] = [
        //11   12   13  
        ' 0b00 0c00 0d00'.replace(/ /g, ''),
        { a: 'XYZ' },
        { XYZ: ['u16', 'u16', 'u16'] },
        [{ a: [11, 12, 13] }, 6]
    ];
    b = Buffer.from(h, 'hex');
    expect(JSON.stringify(r = readBufferLe(b, parseStruct(s, t)))).toBe(JSON.stringify(x));
    expect(r[0]).toBe(s);
    expect(r[1]).toBe(h.length / 2);

    [h, s, t, x] = [
        //21       21
        ' 0000a841 0000a841'.replace(/ /g, ''),
        { g: '2D' },
        { '2D': { x: 'f', y: 'f' } },
        [{ g: { x: 21, y: 21 } }, 8],
    ];
    b = Buffer.from(h, 'hex');
    expect(JSON.stringify(r = readBufferLe(b, parseStruct(s, t)))).toBe(JSON.stringify(x));
    expect(r[0]).toBe(s);
    expect(r[1]).toBe(h.length / 2);

    [h, s, t, x] = [
        //21       21       21
        ' 0100 0000000000003640 0000000000003640 0000000000003640'.replace(/ /g, ''),
        { 'a.length': 'u16', a: 'XYZ' },
        { XYZ: { x: 'd', y: 'd', z: 'd' } },
        [{ a: [{ x: 22, y: 22, z: 22 }] }, 26]
    ];
    b = Buffer.from(h, 'hex');
    expect(JSON.stringify(r = readBufferLe(b, parseStruct(s, t)))).toBe(JSON.stringify(x));
    expect(r[0]).toBe(s);
    expect(r[1]).toBe(h.length / 2);
});