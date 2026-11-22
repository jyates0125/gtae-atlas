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
console.log('Atlas 29.1 dashboard source checks passed');
