# three-sprite-player

一个适用于**小程序** Threejs 的分块序列图播放工具，包含 cli 工具用于生成分块序列图。

## 解决的问题

由于微信小程序不支持 2048\*2948 以上大小的纹理图片（小米 8，IOS），所以合成的序列帧需要每张 2048\*2048 以下，多张加载的方式。

纹理的 encoding 设置默认 _sRGBEncoding_

> 注: JIMP resize 透明图片会导致颜色不对 [jimp/issues/442](https://github.com/oliver-moran/jimp/issues/442)

## 效果图

<div>
  <img src="https://raw.githubusercontent.com/deepkolos/three-sprite-player/master/demo.gif" width="250" alt="" style="display:inline-block;"/>
</div>

## 使用

```sh
> npm i -S three-sprite-player
```

```sh
> tsp-cli -h

  -h --help                                                                      显示帮助
  -v --version                                                                   显示版本
  -i --input [dir] [?tileW] [?w] [?h] [?cropX] [?cropY] [?cropW] [?cropH]        合成分块序列帧
  -r --recurse [dir] [?tileW] [?w] [?h] [?cropX] [?cropY] [?cropW] [?cropH]      递归文件夹合成分块序列帧

Examples:
  tsp-cli -i '../examples/img/frames' 1024
  tsp-cli -i '../examples/img/frames' 1024 100 100 0 0 100 100
  tsp-cli -r '../examples' 1024 100 100 0 0 100 100
```

```js
const tile = {
  url: Array(3)
    .fill(0)
    .map((v, k) => `../img/output-${k}.png`),
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

Promise.all(tile.url.map(i => textureLoader.loadAsync(i))).then(tiles => {
  const spritePlayer = new ThreeSpritePlayer(
    tiles,
    tile.total,
    tile.row,
    tile.col,
    tile.fps,
  );

  const geometry = new THREE.PlaneGeometry(tile.w, tile.h);
  const material = new THREE.MeshBasicMaterial({
    map: spritePlayer.texture,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(tile.x, tile.y, tile.z);
  scene.add(mesh);

  function render() {
    requestAnimationFrame(render);
    spritePlayer.animate();
    // 更新material.map
    material.map = spritePlayer.texture;
    renderer.render(scene, camera);
  }

  render();
});
```

网页示例的使用请参考`examples/web`
小程序示例的使用请参考`examples/mini-program`

> 合成后的图片推荐使用[Imagine](https://github.com/meowtec/Imagine)或者[TinyPNG](https://tinypng.com/)进行进一步压缩体积

## TODO

0. 支持生成 2 的幂次方 tile（done 通过 jimp.contain 实现，默认取大于素材宽高大的 2 的幂次方
1. 生成 glTF（待定
2. 批处理（done

# 感谢

https://github.com/MaciejWWojcik/three-plain-animator

精简代码，适配小程序，支持分块序列帧，无 threejs 依赖

# LICENSE

MIT
