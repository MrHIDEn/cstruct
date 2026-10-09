// Browser smoke test for @mrhiden/cstruct (CStructUint8Array / DataView path).
// Runs against the bundled lib exposed as globalThis.CStructBundle.
// Edit assertions here; run via `npm run bench:browser`.
(function () {
    'use strict';
    var C = globalThis.CStructBundle;
    var results = [];
    var pass = 0;
    var fail = 0;

    function hex(bytes) {
        var s = '';
        for (var i = 0; i < bytes.length; i++) {
            s += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
        }
        return s;
    }

    function deepEq(a, b) {
        if (a === b) return true;
        if (typeof a === 'bigint' || typeof b === 'bigint') {
            return typeof a === 'bigint' && typeof b === 'bigint' && a === b;
        }
        if (a instanceof Uint8Array || b instanceof Uint8Array) {
            if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) return false;
            if (a.length !== b.length) return false;
            for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
            return true;
        }
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        var ka = Object.keys(a), kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (var k = 0; k < ka.length; k++) {
            if (!deepEq(a[ka[k]], b[ka[k]])) return false;
        }
        return true;
    }

    function ok(name, cond) {
        if (cond) { pass++; results.push('PASS  ' + name); }
        else { fail++; results.push('FAIL  ' + name); }
    }

    function throws(name, fn, re) {
        try { fn(); ok(name, false); }
        catch (e) { ok(name, re.test(String(e && e.message || e))); }
    }

    // 1. basic LE make bytes
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i16', c: 'f' });
        var r = uv.make({ a: 1, b: -2, c: 1.5 });
        ok('basic LE make bytes', hex(r.bytes) === '01feff0000c03f');
        ok('basic LE make offset/size', r.offset === 7 && r.size === 7);
        ok('basic LE read parity', deepEq(uv.read(r.bytes).struct, { a: 1, b: -2, c: 1.5 }));
    })();

    // 2. BE array
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i16[3]' }, undefined, { endian: 'be' });
        var data = { a: 1, b: [0x0102, 0x0304, 0x0506] };
        var r = uv.make(data);
        ok('BE array make bytes', hex(r.bytes) === '01010203040506');
        ok('BE array read parity', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 3. constructor options form
    (function () {
        var uv = new C.CStructUint8Array({ a: 'u8', b: 'i16' }, { endian: 'be' });
        var r = uv.make({ a: 1, b: 0x0203 });
        ok('ctor {endian:be} bytes', hex(r.bytes) === '010203');
        ok('ctor {endian:be} read', deepEq(uv.read(new Uint8Array([1, 2, 3])).struct, { a: 1, b: 0x0203 }));
    })();

    // 4. full-width scalars + bools
    (function () {
        var model = { u: 'u32', i: 'i32', q: 'u64', l: 'i64', db: 'd', flag: 'b8', flag16: 'b16' };
        var data = { u: 0xffffffff, i: -5, q: BigInt('18446744073709551615'), l: BigInt(-1), db: 123.456, flag: true, flag16: false };
        var uv = C.CStructUint8Array.fromModelTypes(model);
        var r = uv.make(data);
        ok('scalars u32/i32/u64/i64/d/bools roundtrip', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 5. static strings s4/ws4
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ name: 's4', wname: 'ws4' });
        var r = uv.make({ name: 'ab', wname: 'cd' });
        ok('static strings bytes', hex(r.bytes) === '616200006300640000000000');
        ok('static strings read', deepEq(uv.read(r.bytes).struct, { name: 'ab', wname: 'cd' }));
    })();

    // 6. null-terminated s0
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ name: 's0' });
        var r = uv.read(new Uint8Array([0x61, 0x62, 0x63, 0x00, 0xff, 0xff]));
        ok('s0 null-terminated', deepEq(r.struct, { name: 'abc' }) && r.offset === 4);
    })();

    // 7. dynamic string s[i16]
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ name: 's[i16]' });
        var data = { name: 'sensor-01' };
        var r = uv.make(data);
        ok('dynamic string bytes', hex(r.bytes) === '090073656e736f722d3031');
        ok('dynamic string read', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 8. dynamic buffer buf[i16]
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ blob: 'buf[i16]' });
        var value = new Uint8Array([1, 2, 3, 4, 5]);
        var r = uv.make({ blob: value });
        ok('dynamic buffer bytes', hex(r.bytes) === '05000102030405');
        var back = uv.read(r.bytes).struct;
        ok('dynamic buffer read', back.blob instanceof Uint8Array && deepEq(back.blob, value));
    })();

    // 9. nested + enum (BE)
    (function () {
        var model = {
            a: 'u8',
            state: { type: 'u8', enum: { 1: 'IDLE', 2: 'RUN', 3: 'FAULT' } },
            d: { b: 'i16', c: 'f' }
        };
        var data = { a: 1, state: 'RUN', d: { b: 0x0203, c: 1.0 } };
        var uv = C.CStructUint8Array.fromModelTypes(model, undefined, { endian: 'be' });
        var r = uv.make(data);
        ok('nested+enum bytes', hex(r.bytes) === '010202033f800000');
        ok('nested+enum read', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 10. json j[i16]
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ meta: 'j[i16]' });
        var data = { meta: { x: 1, tags: ['a', 'b'] } };
        var r = uv.make(data);
        ok('json roundtrip', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 11. make returns plain Uint8Array (no Buffer)
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ a: 'u8' });
        var r = uv.make({ a: 7 });
        ok('make returns Uint8Array', r.bytes instanceof Uint8Array && r.bytes.constructor === Uint8Array);
    })();

    // 12. read accepts byteOffset view
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i16' });
        var big = new Uint8Array([0xff, 0xff, 1, 0xfe, 0xff]);
        var r = uv.read(big.subarray(2));
        ok('byteOffset view read', deepEq(r.struct, { a: 1, b: -2 }) && r.offset === 3);
    })();

    // 13. write into pre-allocated Uint8Array
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i16' });
        var target = new Uint8Array(10).fill(0xee);
        var r = uv.write(target, { a: 1, b: -2 }, 2);
        ok('write offset/ref', r.offset === 5 && r.bytes === target);
        ok('write bytes', hex(target) === 'eeee01feffeeeeeeeeee');
    })();

    // 14. write too-short throws
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ a: 'u8', b: 'i32' });
        throws('write too-short throws', function () { uv.write(new Uint8Array(3), { a: 1, b: 2 }); }, /too short/);
    })();

    // 15. fromCompiled parity
    (function () {
        var model = { a: 'u8', d: { b: 'i16', c: 'f' } };
        var data = { a: 1, d: { b: -2, c: 1.5 } };
        var json = C.CStructUint8Array.fromModelTypes(model).jsonModel;
        var uv = C.CStructUint8Array.fromCompiled(json);
        var r = uv.make(data);
        ok('fromCompiled roundtrip', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 16. unknown type throws
    (function () {
        var uv = C.CStructUint8Array.fromModelTypes({ x: 'nosuchtype' });
        throws('unknown type throws', function () { uv.make({ x: 1 }); }, /Unknown type/);
    })();

    // 17. invalid endian throws
    (function () {
        throws('invalid endian throws', function () { C.CStructUint8Array.fromModelTypes({ a: 'u8' }, undefined, { endian: 'xx' }); }, /Invalid endian/);
    })();

    // 18. aliases parity
    (function () {
        var model = { a: 'uint8', flag: 'BOOL', b: 'INT', c: 'float', name: 'string4' };
        var data = { a: 1, flag: true, b: -2, c: 1.5, name: 'ab' };
        var uv = C.CStructUint8Array.fromModelTypes(model);
        var r = uv.make(data);
        ok('aliases roundtrip', deepEq(uv.read(r.bytes).struct, data));
    })();

    // 19. codegen: compileRead / compileMake / compileWrite
    (function () {
        var model = { a: 'u8', b: 'i16', c: 'f' };
        var data = { a: 1, b: -2, c: 1.5 };
        var uv = C.CStructUint8Array.fromModelTypes(model);
        var ref = uv.make(data).bytes;

        var makeFn = uv.compileMake();
        var readFn = uv.compileRead();
        var writeFn = uv.compileWrite();

        var made = makeFn(data);
        ok('codegen make bytes == interpreter', deepEq(made.bytes, ref));
        ok('codegen read roundtrip', deepEq(readFn(made.bytes).struct, data));

        var target = new Uint8Array(8).fill(0);
        var wres = writeFn(data, target, 0);
        ok('codegen write bytes == interpreter', deepEq(target.subarray(0, ref.length), ref));
        ok('codegen write offset/size', wres.offset === 7 && wres.size === 7);
    })();

    var pre = document.createElement('pre');
    pre.id = 'out';
    pre.textContent = 'CStruct browser smoke test\n' +
        'pass: ' + pass + ', fail: ' + fail + ', total: ' + (pass + fail) + '\n\n' +
        results.join('\n') + '\n\n' +
        (fail === 0 ? 'RESULT: ALL OK' : 'RESULT: FAILURES PRESENT');
    document.body.appendChild(pre);
    document.title = (fail === 0 ? 'PASS ' : 'FAIL ') + pass + '/' + (pass + fail);
})();
