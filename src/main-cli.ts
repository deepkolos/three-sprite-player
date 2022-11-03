import * as Jimp from 'jimp';
import fs from 'fs';
import os from 'os';
import path from 'path';
import CLI from './cli';
import process from 'process';
import { alginPowOfTwo, exec, Pool, walkDir } from './utils';
import { version } from '../package.json';

const cli = new CLI();

interface Args {
  w?: string;
  h?: string;
  dir: string;
  tileW?: string;
  cropX?: string;
  cropY?: string;
  cropW?: string;
  cropH?: string;
}

interface ArgsParsed {
  dir: string;
  tileW: number;
  imgW: number;
  imgH: number;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  imgs: string[];
}

async function parseArgs({
  w,
  h,
  dir,
  tileW,
  cropX,
  cropY,
  cropW,
  cropH,
}: Args): Promise<ArgsParsed> {
  dir = path.resolve(process.cwd(), dir);
  const imgs = fs
    .readdirSync(dir)
    .filter(i => i.match(/\.(png)$/i))
    .sort();

  if (!imgs.length) throw new Error('empty directory');

  const oneImg = await Jimp.create(dir + path.sep + imgs[0]);
  const imgW = ~~w || alginPowOfTwo(oneImg.getWidth());
  const imgH = ~~h || alginPowOfTwo(oneImg.getHeight());

  return {
    dir,
    imgs,
    imgW,
    imgH,
    cropX: ~~cropX,
    cropY: ~~cropY,
    tileW: tileW === undefined ? 2048 : ~~tileW,
    cropW: cropW === undefined ? imgW : ~~cropW,
    cropH: cropH === undefined ? imgH : ~~cropH,
  };
}

const main = async (args: Args) => {
  try {
    const t = Date.now();
    // prettier-ignore
    const { dir, tileW, imgs, cropW, cropH, cropX, cropY, imgW, imgH } = await parseArgs(args,);
    const col = Math.floor(tileW / cropW);
    let row = Math.floor(tileW / cropH);
    const tileNum = Math.ceil(imgs.length / (col * row));
    const dirName =
      path.resolve(path.relative(process.cwd(), dir), '..') +
      path.sep +
      path.basename(dir);
    row = tileNum === 1 ? Math.ceil(imgs.length / col) : row;

    await Promise.all(
      Array(tileNum)
        .fill(0)
        .map(async (v, t) => {
          const tileImg = await Jimp.create(
            col * cropW,
            row * cropH,
            Jimp.rgbaToInt(0, 0, 0, 0),
          );
          let sum = 0;
          const drawSprites = [];
          for (let r = 0; r < row; r++) {
            for (let c = 0; c < col; c++) {
              const index = t * row * col + r * col + c;
              if (index < imgs.length) {
                drawSprites.push(
                  (async () => {
                    const img = await Jimp.create(dir + path.sep + imgs[index]);
                    // resize transparency error https://github.com/oliver-moran/jimp/issues/442
                    if (img.getHeight() !== imgH || img.getWidth() !== imgW) {
                      img.resize(imgW, imgH);
                      // img.contain(imgW, imgH);
                      img.crop(cropX, cropY, cropW, cropH);
                    }
                    tileImg.composite(img, c * cropW, r * cropH);
                    sum++;
                  })(),
                );
              }
            }
          }
          await Promise.all(drawSprites);

          console.log(`tile-${t} contains ${sum} sprites`);
          await tileImg.writeAsync(`${dirName}-${t}.png`);
        }),
    );

    // prettier-ignore
    fs.writeFileSync(
      `${dirName}.json`,
      JSON.stringify(
        {
          tileNum,
          spriteNum: imgs.length,
          col, row, imgW, imgH, cropW, cropH, tileW,
        },
        null,
        2,
      ),
    );

    console.log(`
cost: ${Date.now() - t}ms
col: ${col}
row: ${row}
tileNum: ${tileNum}
spriteNum: ${imgs.length}
imgW: ${imgW}   cropW: ${cropW}
imgH: ${imgH}   cropH: ${cropH}
`);
  } catch (error) {
    console.log('error:', error?.message);
  }
};

cli
  .action('-h --help', '显示帮助', '', () => cli.help())
  .action('-v --version', '显示版本', '', () => console.log(version))
  .action<Args>(
    '-i --input [dir] [?tileW] [?w] [?h] [?cropX] [?cropY] [?cropW] [?cropH]',
    '合成分块序列帧',
    '',
    main,
  )
  .action<Args>(
    '-r --recurse [dir] [?tileW] [?w] [?h] [?cropX] [?cropY] [?cropW] [?cropH]',
    '递归文件夹合成分块序列帧',
    '',
    async args => {
      const dir = path.resolve(process.cwd(), args.dir);
      const {
        tileW = '',
        w = '',
        h = '',
        cropX = '',
        cropY = '',
        cropW = '',
        cropH = '',
      } = args;
      const pool = new Pool(dirname => {
        return exec(
          `tsp-cli -i ${dirname} ${tileW} ${w} ${h} ${cropX} ${cropY} ${cropW} ${cropH}`,
        ).then(stdout => {
          console.log(`done: ${dirname}`);
          console.log(stdout);
        });
      }, os.cpus().length);

      walkDir(dir, dir => pool.add(dir));
    },
  )

  .action("tsp-cli -i '../examples/img/frames' 1024", '', 'Examples')
  .action(
    "tsp-cli -i '../examples/img/frames' 1024 100 100 0 0 100 100",
    '',
    'Examples',
  )
  .action("tsp-cli -r '../examples' 1024 100 100 0 0 100 100", '', 'Examples')

  .run(process.argv.slice(2));
