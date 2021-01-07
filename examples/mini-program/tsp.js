var ThreeSpritePlayer = /** @class */ (function () {
    function ThreeSpritePlayer(threeInstance, tiles, totalFrame, row, col, fps, sRGB) {
        var _this = this;
        if (fps === void 0) { fps = 24; }
        if (sRGB === void 0) { sRGB = true; }
        this.threeInstance = threeInstance;
        this.tiles = tiles;
        this.totalFrame = totalFrame;
        this.row = row;
        this.col = col;
        this.currFrame = 0;
        this.playing = true;
        this.currFrame = 0;
        this.frameGap = 1000 / fps;
        tiles.forEach(function (texture) {
            texture.wrapS = threeInstance.ClampToEdgeWrapping;
            texture.wrapT = threeInstance.ClampToEdgeWrapping;
            texture.minFilter = threeInstance.LinearFilter;
            texture.repeat.set(1 / _this.col, 1 / _this.row);
            if (sRGB)
                texture.encoding = threeInstance.sRGBEncoding;
        });
        this.updateOffset();
    }
    ThreeSpritePlayer.prototype.initMesh = function (w, h) {
        var geometry = new this.threeInstance.PlaneGeometry(w, h);
        var material = new this.threeInstance.MeshBasicMaterial({
            map: this.texture,
            transparent: true
        });
        this.mesh = new this.threeInstance.Mesh(geometry, material);
        return this.mesh;
    };
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
        if (nextFrame > this.currFrame) {
            this.startTime = now;
            this.startFrame = this.currFrame;
        }
        this.updateOffset();
        // console.log(this.currTile, this.currTileOffset);
        if (this.mesh)
            this.mesh.material.map = this.texture;
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
        this.threeInstance = null;
    };
    return ThreeSpritePlayer;
}());

export default ThreeSpritePlayer;
