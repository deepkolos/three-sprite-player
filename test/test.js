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
  });
}

async function test() {
  const textures = [new Texture(), new Texture()];
  const player = new ThreeSpritePlayer(textures);

  async function step(tile, offset) {
    await sleep(16);
    player.animate();
    assert.strictEqual(player.currFrame, tile);
    assert.strictEqual(player.currTileOffset, offset);
  }

  await step(0, 0);
  await step(0, 1);
  await step(0, 2);
}

test();
