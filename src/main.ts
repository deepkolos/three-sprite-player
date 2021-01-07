import * as THREE from 'three';

export default class ThreeSpritePlayer {
  protected currFrame: number = 0;
  protected frameGap: number;
  protected startTime?: number;
  protected startFrame?: number;
  playing: boolean;
  currTile: number;
  currTileOffset: number;
  mesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  constructor(
    protected tiles: THREE.Texture[],
    protected totalFrame: number,
    protected row: number,
    protected col: number,
    fps = 24,
    sRGB = true,
  ) {
    this.playing = true;
    this.currFrame = 0;
    this.frameGap = 1000 / fps;
    tiles.forEach(texture => {
      texture.wrapS = 1001; // THREE.ClampToEdgeWrapping;
      texture.wrapT = 1001; // three.ClampToEdgeWrapping;
      texture.minFilter = 1006; // THREE.LinearFilter
      texture.repeat.set(1 / this.col, 1 / this.row);
      if (sRGB)
        texture.encoding = 3001; // THREE.sRGBEncoding
    });
    this.updateOffset();
  }

  public stop() {
    this.playing = false;
  }

  public play() {
    this.playing = true;
    this.startTime = Date.now()
    this.startFrame = this.currFrame
  }

  public get texture() {
    return this.tiles[this.currTile];
  }

  public animate() {
    if (!this.playing || this.totalFrame === 1) return

    const now = Date.now();
    this.startTime = this.startTime ?? now;
    this.startFrame = this.startFrame ?? this.currFrame;
    const nextFrame = this.startFrame + ~~((now - this.startTime) / this.frameGap)
    this.currFrame = nextFrame % this.totalFrame

    if (nextFrame > this.currFrame) {
      this.startTime = now
      this.startFrame = this.currFrame
    }

    this.updateOffset()
  }

  protected updateOffset() {
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

  public dispose() {
    this.mesh?.material.dispose()
    this.tiles.forEach(texture => texture.dispose());
    this.tiles.length = 0;
    this.mesh = null
  }
}
