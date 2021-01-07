import * as Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import CLI from './cli';
import process from 'process';

const cli = new CLI();

interface Args {
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
  dir,
  tileW,
  cropX,
  cropY,
  cropW,
  cropH,
}: Args): Promise<ArgsParsed> {
  dir = path.resolve(process.cwd(), dir);
  const imgs = fs.readdirSync(dir).sort();

  if (!imgs.length) throw new Error('empty directory');

  const oneImg = await Jimp.create(dir + path.sep + imgs[0]);
  const imgW = oneImg.getWidth();
  const imgH = oneImg.getHeight();

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
    const t = Date.now()
    // prettier-ignore
    const { dir, tileW, imgs, cropW, cropH, cropX, cropY, imgW, imgH } = await parseArgs(args,);
    const col = Math.floor(tileW / cropW);
    const row = Math.floor(tileW / cropH);
    const tileNum = Math.ceil(imgs.length / (col * row));
    // console.log(imgs, imgW, imgH)
    // console.log(col, row, tileNum);
    // console.log(dir, tileW, cropX, cropY, cropW, cropH);
    // return;

    await Promise.all(Array(tileNum).fill(0).map(async (v, t) => {
      const tileImg = await Jimp.create(
        col * cropW,
        row * cropH,
        Jimp.rgbaToInt(0, 0, 0, 0),
      );
      let sum = 0;
      const drawSprites = []
      for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
          const index = t * row * col + r * col + c;
          if (index < imgs.length) {
            drawSprites.push((async () => {
              const img = await Jimp.create(dir + path.sep + imgs[index]);
              img.resize(imgW, imgH);
              img.crop(cropX, cropY, cropW, cropH);
              tileImg.composite(img, c * cropW, r * cropH);
              sum++;
            })())
          }
        }
      }
      await Promise.all(drawSprites)

      console.log(`tile-${t} contains ${sum} sprites`);
      await tileImg.writeAsync(`output-${t}.png`);
    }))

    console.log(`
cost: ${Date.now() - t}ms
col: ${col}
row: ${row}
tileNum: ${tileNum}
spriteNum: ${imgs.length}
imgW: ${imgW}   cropW: ${cropW}
imgH: ${imgH}   cropH: ${cropH}
`)
  } catch (error) {
    console.log(error)
  }
};

cli
  .action('-h --help', '显示帮助', '', () => cli.help())
  .action<Args>(
    '-i --input [dir] [?tileW] [?cropX] [?cropY] [?cropW] [?cropH]',
    '列出环境变量',
    '',
    main,
  )

  .action("tsp-cli -i '../examples/img/frames' 1024", '', 'Examples')
  .action("tsp-cli -i '../examples/img/frames' 1024 0 0 100 100", '', 'Examples')

  .run(process.argv.slice(2));
