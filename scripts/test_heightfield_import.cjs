const assert = require('node:assert/strict');
require('../atlas-3d.js');

async function test() {
  for (const game of ['5', '6']) {
    const {width, height} = JuraTerrain3D.ELEVATIONS[game];
    const samples = new Uint16Array(width * height);
    const engine = JuraTerrain3D.create({
      canvas: {addEventListener() {}},
      bridge: {game: () => game},
    });
    await assert.rejects(engine.setElevationBinary(samples.buffer, game), /identical/);
    assert.equal(engine.hasElevation(), false);
    samples[samples.length - 1] = 31;
    assert.equal(await engine.setElevationBinary(samples.buffer, game), true);
    await assert.rejects(engine.setElevationBinary(new ArrayBuffer(2), game), /bytes/);
    await assert.rejects(engine.setElevationBinary(samples.fill(42).buffer, game), /identical/);
    assert.equal(engine.hasElevation(), true);
    await assert.rejects(engine.setElevationBinary(samples.buffer, game === '5' ? '6' : '5'), /matching game/);
  }
}
test().catch(error => { console.error(error); process.exitCode = 1; });
