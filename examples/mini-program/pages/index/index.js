import ThreeSpritePlayer from '../../tsp';
import { createScopedThreejs } from 'threejs-miniprogram';

function getNode(id, ctx, fields = { node: true, rect: true, size: true }) {
  return new Promise(function (resolve) {
    wx.createSelectorQuery().in(ctx).select(id).fields(fields).exec(resolve);
  });
}

const { windowWidth, windowHeight, pixelRatio } = wx.getSystemInfoSync();

Page({
  async onLoad() {
    const tile = {
      url: Array(3)
        .fill(0)
        .map((v, k) => `/imgs/output-${k}.png`),
      x: 0,
      y: 0,
      z: -15,
      w: (10 * 358) / 358,
      h: 10,
      col: 2,
      row: 2,
      total: 10,
      fps: 16,
    };
    const canvas = (await getNode('#canvas', this))[0].node;
    const THREE = createScopedThreejs(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas });
    // renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      windowWidth / windowHeight,
      0.1,
      100,
    );
    const textureLoader = new THREE.TextureLoader();

    renderer.setSize(windowWidth, windowHeight);
    renderer.setPixelRatio(pixelRatio);

    Promise.all(
      tile.url.map(
        url =>
          new Promise((resolve, reject) => {
            textureLoader.load(
              url,
              texture => resolve(texture),
              undefined,
              reject,
            );
          }),
      ),
    ).then(tiles => {
      const spritePlayer = new ThreeSpritePlayer(
        tiles,
        tile.total,
        tile.row,
        tile.col,
        tile.fps,
        false,
      );
      // 可以自行构建mesh
      const geometry = new THREE.PlaneGeometry(tile.w, tile.h);
      const material = new THREE.MeshBasicMaterial({
        map: spritePlayer.texture,
        transparent: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(tile.x, tile.y, tile.z);
      scene.add(mesh);
      // spritePlayer.stop();

      function render() {
        canvas.requestAnimationFrame(render);
        spritePlayer.animate();
        // 更新material.map
        material.map = spritePlayer.texture;
        renderer.render(scene, camera);
      }

      render();
    });
  },
});
