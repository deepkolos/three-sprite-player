const assert = require('assert');
const ThreeSpritePlayer = require('../dist/three-sprite-player.cjs');

class Texture {
  constructor() {
    this.offset = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.repeat = {
      set() {},
    };
  }

  dispose() {}
}

function sleep(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t);
    // node的setTimeout不准确,t = 16, 实际31
  });
}

async function test() {
  const textures = [new Texture(), new Texture()];
  const player = new ThreeSpritePlayer(textures, 10, 2, 2, 1000 / 30);

  async function step(tile, offset) {
    player.animate();
    assert.strictEqual(player.currTile, tile);
    assert.strictEqual(player.currTileOffset, offset);
    await sleep(30);
  }

  await step(0, 0);
  await step(0, 1);
  await step(0, 2);
  await step(0, 3);
}

test();
