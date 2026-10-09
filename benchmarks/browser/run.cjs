#!/usr/bin/env node
/**
 * Browser smoke test runner for @mrhiden/cstruct (CStructUint8Array / DataView path).
 *
 * Manual only — NOT wired into CI (see benchmarks/BROWSER-TEST.md). Run with:
 *
 *   npm run bench:browser
 *
 * What it does:
 *   1. builds lib/ (tsc) if missing,
 *   2. bundles the CommonJS lib/ into a single IIFE (no external bundler needed),
 *   3. generates a self-contained HTML page with the assertions in test.js,
 *   4. runs a local headless Chrome/Chromium and parses the result.
 *
 * Exit code 0 = all assertions passed, 1 = failures or missing prerequisites.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const LIB = path.join(ROOT, 'lib');
const ENTRY = path.join(LIB, 'index.js');
const TMP = path.join(__dirname, '.tmp');
const BUNDLE = path.join(TMP, 'bundle.js');
const HTML = path.join(TMP, 'test.html');
const PROFILE = path.join(TMP, 'chrome-profile');

function log(msg) { console.log(msg); }

// ---------------------------------------------------------------- build lib
function ensureLibBuilt() {
    if (fs.existsSync(ENTRY)) return;
    log('lib/ not found — running tsc (npm run build)…');
    const tsc = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
    if (!fs.existsSync(tsc)) {
        console.error('typescript is not installed. Run `npm install` first.');
        process.exit(1);
    }
    const r = spawnSync(process.execPath, [tsc], { cwd: ROOT, stdio: 'inherit' });
    if (r.status !== 0) {
        console.error('tsc build failed.');
        process.exit(1);
    }
}

// ------------------------------------------------------------- bundle lib/
function bundle() {
    const modules = new Map(); // absPath -> rewritten source (null while in-progress)

    function resolveModule(fromFile, spec) {
        if (!spec.startsWith('.')) {
            throw new Error(`Cannot bundle external module "${spec}" required by ${fromFile}`);
        }
        let p = path.resolve(path.dirname(fromFile), spec);
        if (fs.existsSync(p + '.js')) return p + '.js';
        if (fs.existsSync(path.join(p, 'index.js'))) return path.join(p, 'index.js');
        return p + '.js';
    }

    function load(file) {
        file = path.resolve(file);
        if (modules.has(file)) return;
        modules.set(file, null); // in-progress (cycle guard)
        let src = fs.readFileSync(file, 'utf8');
        src = src.replace(/require\((["'])([^"']+)\1\)/g, (_m, _q, spec) => {
            const r = resolveModule(file, spec);
            load(r);
            return `__require(${JSON.stringify(r)})`;
        });
        modules.set(file, src);
    }

    load(ENTRY);

    const sourceLines = [];
    for (const [file, src] of modules) {
        if (src === null) throw new Error(`Circular require detected at ${file}`);
        sourceLines.push(`  __sources[${JSON.stringify(file)}] = ${JSON.stringify(src)};`);
    }

    const out = [
        '(function () {',
        "  'use strict';",
        '  const __sources = Object.create(null);',
        '  const __modules = Object.create(null);',
        '  function __require(id) {',
        '    if (__modules[id]) return __modules[id].exports;',
        '    const m = { exports: {} };',
        '    __modules[id] = m;',
        '    const fn = new Function("require", "module", "exports", "__require", __sources[id]);',
        '    fn((s) => __require(resolveId(id, s)), m, m.exports, __require);',
        '    return m.exports;',
        '  }',
        '  function resolveId(_from, _s) { return _s; }',
        ...sourceLines,
        `  globalThis.CStructBundle = __require(${JSON.stringify(ENTRY)});`,
        '})();',
        '',
    ].join('\n');

    return { bundle: out, moduleCount: sourceLines.length };
}

// ------------------------------------------------------------- locate chrome
function findChrome() {
    const candidates = [
        process.env.CHROME_BIN,
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome-stable',
        '/snap/bin/chromium',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ].filter(Boolean);
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    // last resort: PATH lookup on unix-like shells
    for (const name of ['google-chrome', 'chromium', 'chromium-browser', 'google-chrome-stable']) {
        const r = spawnSync('which', [name], { encoding: 'utf8' });
        if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
    }
    return null;
}

// ------------------------------------------------------------- main
function main() {
    ensureLibBuilt();

    fs.mkdirSync(TMP, { recursive: true });

    const { bundle: bundleSrc, moduleCount } = bundle();
    fs.writeFileSync(BUNDLE, bundleSrc);

    const testSrc = fs.readFileSync(path.join(__dirname, 'test.js'), 'utf8');
    const html = [
        '<!doctype html>',
        '<html><head><meta charset="utf-8"><title>cstruct-browser-test</title></head>',
        '<body>',
        '<script>', bundleSrc, '</script>',
        '<script>', testSrc, '</script>',
        '</body></html>',
        '',
    ].join('\n');
    fs.writeFileSync(HTML, html);

    const chrome = findChrome();
    if (!chrome) {
        console.error('No Chrome/Chromium found. Set CHROME_BIN to the browser executable.');
        process.exit(1);
    }

    log(`Bundled ${moduleCount} modules from lib/`);
    log(`Running headless browser: ${chrome}`);
    const r = spawnSync(chrome, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=${PROFILE}`,
        '--virtual-time-budget=5000',
        '--dump-dom',
        'file://' + HTML,
    ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

    const stdout = r.stdout || '';
    const titleMatch = stdout.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '(no title)';
    const preMatch = stdout.match(/<pre id="out">([\s\S]*?)<\/pre>/);
    const report = preMatch
        ? preMatch[1]
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        : '(no result block found)';

    log('\n' + report.trim() + '\n');
    log('title: ' + title);

    const failed = /FAIL\s+\d+\/\d+/.test(title) || /RESULT:\s*FAILURES PRESENT/.test(report) || /FAIL\s{2}/.test(report);
    if (failed) {
        log('RESULT: FAILURES PRESENT');
        process.exit(1);
    }
    log('RESULT: ALL OK');
}

main();
