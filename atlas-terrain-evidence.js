/* Team Jura / Elario Studios: terrain evidence validator.
 * Verification of a manifest is NOT legal authorization or independent proof
 * that the manifest's external sources are authentic. Human source review is mandatory.
 * No third-party network requests are made by this module. */
(function (root) {
'use strict';
const error = message => { throw Error('Terrain evidence: ' + message); };
const finite = n => typeof n === 'number' && Number.isFinite(n);
function https(value) {
  if (typeof value !== 'string' || !/^https:\/\/[^/\s?#]+(?:[/?#][^\s]*)?$/i.test(value)) error('an HTTPS source/evidence URL is required');
}
function heightAt(view, definition, point) {
  const px = definition.zero[0] + point.x * definition.scaleXY;
  const py = definition.zero[1] - point.y * definition.scaleXY;
  if (!finite(px) || !finite(py) || px < 0 || py < 0 ||
      px >= definition.width - 1 || py >= definition.height - 1) error('control point outside heightfield');
  const x = Math.floor(px), y = Math.floor(py), fx = px - x, fy = py - y;
  const w = definition.width, read = (cx, cy) => view.getUint16(2 * (cy * w + cx), true);
  const top = read(x,y) * (1-fx) + read(x+1,y) * fx;
  const bottom = read(x,y+1) * (1-fx) + read(x+1,y+1) * fx;
  return ((top * (1-fy) + bottom * fy) / definition.scaleZ) + definition.offset;
}
async function verify(buffer, proof, definition, game, webcrypto) {
  if (!(buffer instanceof ArrayBuffer) ||
      buffer.byteLength !== definition.width * definition.height * 2) error('unexpected binary size');
  if (!proof || proof.schema !== 'team-jura-terrain-proof-v1' ||
      proof.game !== Number(game) || proof.encoding !== 'uint16-le' ||
      !proof.grid || proof.grid.width !== definition.width || proof.grid.height !== definition.height ||
      proof.coordinateSystem !== 'gtadb-game-xy') error('wrong schema, dimensions, game or coordinate system');
  if (!/^[a-f0-9]{64}$/i.test(proof.sha256 || '')) error('SHA-256 digest is missing');
  const source = proof.source;
  if (!source || source.redistributionPermission !== true ||
      typeof source.license !== 'string' || source.license.trim().length < 3 ||
      typeof source.revision !== 'string' || source.revision.trim().length < 7) error('pinned source and explicit rights declaration required');
  https(source.url); https(source.rightsEvidenceUrl);
  const controls = proof.controlPoints;
  if (!Array.isArray(controls) || controls.length < 3 || controls.length > 32) error('at least three independent control points required');
  const xy = [];
  for (const p of controls) {
    if (!p || !finite(p.x) || !finite(p.y) || !finite(p.zMeters) ||
        !finite(p.toleranceMeters) || p.toleranceMeters <= 0 || p.toleranceMeters > 40 ||
        p.basis !== 'independent' || typeof p.label !== 'string' || !p.label.trim()) error('invalid or unverified independent control point');
    https(p.evidenceUrl);
    xy.push([p.x,p.y]);
  }
  const xs = xy.map(p=>p[0]), ys = xy.map(p=>p[1]);
  if (Math.max(...xs) - Math.min(...xs) < 2000 ||
      Math.max(...ys) - Math.min(...ys) < 2000) error('control points do not cover enough of the map');
  let maxTriangle = 0;
  for (let i = 0; i < xy.length; i++) for (let j = i+1; j < xy.length; j++)
    for (let k = j+1; k < xy.length; k++) {
      const a=xy[i], b=xy[j], c=xy[k];
      maxTriangle=Math.max(maxTriangle,Math.abs((b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1])));
    }
  if (maxTriangle < 1000000) error('control points are collinear or too close');
  const cryptoApi = webcrypto || root.crypto;
  if (!cryptoApi || !cryptoApi.subtle || typeof cryptoApi.subtle.digest !== 'function') error('secure SHA-256 verification unavailable');
  const hash = Array.from(new Uint8Array(await cryptoApi.subtle.digest('SHA-256',buffer)),
    x=>x.toString(16).padStart(2,'0')).join('');
  if (hash !== proof.sha256.toLowerCase()) error('binary digest does not match the evidence manifest');
  const view = new DataView(buffer);
  let worst = 0;
  for (const p of controls) {
    const residual = Math.abs(heightAt(view, definition, p) - p.zMeters);
    if (residual > p.toleranceMeters) error('alignment mismatch at ' + p.label + ' (' + residual.toFixed(2) + ' m)');
    worst = Math.max(worst,residual);
  }
  return {pointsChecked: controls.length,maxResidualMeters:worst,sha256:hash};
}
root.JuraTerrainEvidence = Object.freeze({verify, heightAt});
if (typeof module !== 'undefined' && module.exports) module.exports = root.JuraTerrainEvidence;
})(typeof window !== 'undefined' ? window : globalThis);
