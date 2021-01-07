var ThreeSpritePlayer = /** @class */ (function () {
    function ThreeSpritePlayer(tiles, totalFrame, row, col, fps, sRGB) {
        var _this = this;
        if (fps === void 0) { fps = 24; }
        if (sRGB === void 0) { sRGB = true; }
        this.tiles = tiles;
        this.totalFrame = totalFrame;
        this.row = row;
        this.col = col;
        this.currFrame = 0;
        this.playing = true;
        this.currFrame = 0;
        this.frameGap = 1000 / fps;
        tiles.forEach(function (texture) {
            texture.wrapS = 1001; // THREE.ClampToEdgeWrapping;
            texture.wrapT = 1001; // three.ClampToEdgeWrapping;
            texture.minFilter = 1006; // THREE.LinearFilter
            texture.repeat.set(1 / _this.col, 1 / _this.row);
            if (sRGB)
                texture.encoding = 3001; // THREE.sRGBEncoding
        });
        this.updateOffset();
    }
    ThreeSpritePlayer.prototype.stop = function () {
        this.playing = false;
    };
    ThreeSpritePlayer.prototype.play = function () {
        this.playing = true;
        this.startTime = Date.now();
        this.startFrame = this.currFrame;
    };
    Object.defineProperty(ThreeSpritePlayer.prototype, "texture", {
        get: function () {
            return this.tiles[this.currTile];
        },
        enumerable: false,
        configurable: true
    });
    ThreeSpritePlayer.prototype.animate = function () {
        var _a, _b;
        if (!this.playing || this.totalFrame === 1)
            return;
        var now = Date.now();
        this.startTime = (_a = this.startTime) !== null && _a !== void 0 ? _a : now;
        this.startFrame = (_b = this.startFrame) !== null && _b !== void 0 ? _b : this.currFrame;
        var nextFrame = this.startFrame + ~~((now - this.startTime) / this.frameGap);
        this.currFrame = nextFrame % this.totalFrame;
        console.log(~~((now - this.startTime) / this.frameGap), now - this.startTime);
        if (nextFrame > this.currFrame) {
            this.startTime = now;
            this.startFrame = this.currFrame;
        }
        this.updateOffset();
    };
    ThreeSpritePlayer.prototype.updateOffset = function () {
        this.currTile = ~~(this.currFrame / (this.col * this.row));
        this.currTileOffset = this.currFrame % (this.col * this.row);
        var texture = this.tiles[this.currTile];
        var tileHeight = 1 / this.row;
        var currentColumn = this.currTileOffset % this.col;
        var currentRow = ~~(this.currTileOffset / this.col);
        if (texture) {
            texture.offset.x = currentColumn / this.col;
            texture.offset.y = 1 - currentRow / this.row - tileHeight;
        }
    };
    ThreeSpritePlayer.prototype.dispose = function () {
        var _a;
        (_a = this.mesh) === null || _a === void 0 ? void 0 : _a.material.dispose();
        this.tiles.forEach(function (texture) { return texture.dispose(); });
        this.tiles.length = 0;
        this.mesh = null;
    };
    return ThreeSpritePlayer;
}());

export default ThreeSpritePlayer;
