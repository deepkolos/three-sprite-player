function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

class ThreeSpritePlayer {
   __init() {this.currFrame = 0;}
  
  
  
  
  
  
  

  constructor(
     tiles,
     totalFrame,
     row,
     col,
    fps = 24,
    sRGB = true,
  ) {this.tiles = tiles;this.totalFrame = totalFrame;this.row = row;this.col = col;ThreeSpritePlayer.prototype.__init.call(this);
    this.playing = true;
    this.currFrame = 0;
    this.frameGap = 1000 / fps;
    tiles.forEach(texture => {
      // texture.wrapS = 1001; // THREE.ClampToEdgeWrapping;
      // texture.wrapT = 1001; // three.ClampToEdgeWrapping;
      // texture.minFilter = 1006; // THREE.LinearFilter
      texture.repeat.set(1 / this.col, 1 / this.row);

      if (sRGB) texture.encoding = 3001; // THREE.sRGBEncoding
    });
    this.updateOffset();
  }

   stop() {
    this.playing = false;
  }

   play() {
    this.playing = true;
    this.startTime = Date.now();
    this.startFrame = this.currFrame;
  }

   get texture() {
    return this.tiles[this.currTile];
  }

   animate() {
    if (!this.playing || this.totalFrame === 1) return

    const now = Date.now();
    this.startTime = _nullishCoalesce(this.startTime, () => ( now));
    this.startFrame = _nullishCoalesce(this.startFrame, () => ( this.currFrame));
    const nextFrame = this.startFrame + ~~((now - this.startTime) / this.frameGap);
    this.currFrame = nextFrame % this.totalFrame;

    if (nextFrame > this.currFrame) {
      this.startTime = now;
      this.startFrame = this.currFrame;
    }

    this.updateOffset();
  }

   updateOffset() {
    this.currTile = ~~(this.currFrame / (this.col * this.row));
    this.currTileOffset = this.currFrame % (this.col * this.row);

    const texture = this.tiles[this.currTile];
    const tileHeight = 1 / this.row;
    const currentColumn = this.currTileOffset % this.col;
    const currentRow = ~~(this.currTileOffset / this.col);

    if (texture) {
      texture.offset.x = currentColumn / this.col;
      texture.offset.y = 1 - currentRow / this.row - tileHeight;
    }
  }

   dispose() {
    _optionalChain([this, 'access', _ => _.mesh, 'optionalAccess', _2 => _2.material, 'access', _3 => _3.dispose, 'call', _4 => _4()]);
    this.tiles.forEach(texture => texture.dispose());
    this.tiles.length = 0;
    this.mesh = null;
  }
}

export default ThreeSpritePlayer;
