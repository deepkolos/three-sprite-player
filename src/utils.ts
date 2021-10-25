import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'child_process';

export function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) reject(err || stderr);
      else resolve(stdout);
    });
  });
}

export function alginPowOfTwo(n: number) {
  if (n < 1) return 1;

  let i = 1;

  while (i < n) i <<= 1;

  return i;
}

export async function walkDir(
  dir: string,
  fn: (dir: string) => void | Promise<void>,
) {
  fs.stat(dir, (err, stat) => {
    if (err) return console.error(dir, 'stat error:', err);

    if (stat.isDirectory()) {
      fs.readdir(dir, (err, list) => {
        if (err) return console.error(dir, 'readdir error:', err);

        for (let item of list) {
          if (item === '.' || item === '..') continue;
          walkDir(dir + path.sep + item, fn);
        }
      });
    }
    if (stat.isDirectory()) fn(dir);
  });
}

export class Pool {
  size: number;
  working: number;
  queue: any[];
  consumer: (obj: any) => any | Promise<any>;

  constructor(consumer: (obj: any) => any | Promise<any>, size = 6) {
    this.size = size;
    this.working = 0;
    this.queue = [];
    this.consumer = consumer;
  }

  async consume(obj: any) {
    this.working++;
    await this.consumer(obj);
    this.working--;
    if (this.queue.length) this.consume(this.queue.shift());
  }

  add(obj: any) {
    if (this.working < this.size) this.consume(obj);
    else this.queue.push(obj);
  }
}
