const {
    PRE_ALLOC_SIZE,
    parseStruct,
} = require('../index');

test('PRE_ALLOC_SIZE', () => {
    expect(PRE_ALLOC_SIZE).toBe(200);
});

test('parseStruct', () => {
    let s;
    let t;
    let r;
    let x;

    s = { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' };
    x = { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' };
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

