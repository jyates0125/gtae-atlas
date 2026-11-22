// Run: node tests/atlas291-shortcuts.test.cjs
// Source regression only; browser/Cloudflare validation remains required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'atlas-dashboard.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'atlas291-shortcuts.css'), 'utf8');
const start = html.indexOf('<details class="j223-shortcuts-menu">');
assert.ok(start !== -1, 'Missing shortcuts disclosure');
const end = html.indexOf('</details>', start);
assert.ok(end > start, 'Missing closing disclosure');
const section = html.slice(start, end);
assert.equal((section.match(/<nav\b/g) || []).length, 1);
assert.equal((section.match(/<\/nav>/g) || []).length, 1);
assert.equal((section.match(/<a href=/g) || []).length, 13, 'Keep all 13 shortcut links');
assert.ok(!section.startsWith('<details open'), 'Start collapsed');
for (const dest of ['maps.html', 'heists.html', 'atlas93-garage.html', 'atlas-research.html']) {
  assert.ok(section.includes('href="./' + dest + '"'), 'Missing ' + dest);
}
assert.ok(html.includes('href="./atlas291-shortcuts.css?v=291"'));
assert.ok(css.includes(':focus-visible'), 'Keyboard focus style missing');
assert.ok(css.includes('max-width:660px'), 'Mobile rule missing');
assert.ok(html.includes('href="./atlas-vi.html?view=rockstar"'), 'Official poster entry missing');
assert.ok(html.includes('href="./atlas-vi.html"'), 'Interactive VI Explorer entry missing');
assert.ok(html.includes('source-labeled community locations'), 'Map provenance note missing');
assert.ok(css.includes('.j223-shortcuts a:focus-visible'), 'Shortcut link focus ring missing');
assert.ok(css.includes('max-width:360px'), 'Very narrow phone fallback missing');
console.log('Atlas 29.1 dashboard source checks passed');

// Route integrity: every dashboard shortcut and featured world must resolve to
// a tracked local HTML page. Query strings never count as part of a file path.
const shortcutHrefs = [...section.matchAll(/<a\s+href="([^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
assert.equal(shortcutHrefs.length, 13);
assert.equal(new Set(shortcutHrefs).size, 13, 'Duplicate dashboard tool destination');
const featured = html.match(/<div class="j223-world-grid"[\s\S]*?<\/div>/);
assert.ok(featured, 'Missing featured world grid');
const featuredHrefs = [...featured[0].matchAll(/<a\s+href="([^"]+)"/g)].map(m => m[1]);
assert.equal(featuredHrefs.length, 7, 'Preserve seven world tiles');
const officialAndResearch = ['./atlas-vi.html?view=rockstar', './atlas-vi.html'];
for (const href of [...shortcutHrefs, ...featuredHrefs, ...officialAndResearch]) {
  assert.ok(href.startsWith('./'), 'Dashboard internal destination must remain relative: ' + href);
  const url = new URL(href, 'https://gtae-online.pages.dev/');
  assert.ok(!url.pathname.includes('..'), 'Unsafe route: ' + href);
  const target = path.join(root, decodeURIComponent(url.pathname));
  assert.ok(fs.existsSync(target) && fs.statSync(target).isFile(), 'Missing internal dashboard destination: ' + href);
}
console.log('Atlas 29.1 route integrity: 13 tools, 7 world tiles, official and community VI entries');
