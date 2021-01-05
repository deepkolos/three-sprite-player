import * as shell from 'child_process';

export function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) reject(err || stderr);
      else resolve(stdout);
    });
  });
}
