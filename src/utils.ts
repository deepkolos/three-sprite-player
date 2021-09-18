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
