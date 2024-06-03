import fs from 'fs';
import path from 'path';
import type { GlobOptions } from 'glob';
import { getDirectoryInfo } from './getDirectoryInfo';
import { consoleDirectoryInfo } from './consoleDirectoryInfo';

export const flatDirectory = async (
  pattern: string = '**/*',
  options: GlobOptions = {
    cwd: path.resolve(process.cwd()),
    absolute: true,
    nodir: false,
    dot: true,
  },
  out: string = path.resolve(process.cwd(), `_output_${Math.random() * Number.MAX_SAFE_INTEGER}`),
  chunk = 0,
) => {
  const directoryInfo = await getDirectoryInfo(pattern, options);

  consoleDirectoryInfo(directoryInfo);

  if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
  }

  const items = directoryInfo.items.filter((file) => file.type === 'file');

  if (chunk > 0) {
    const totalChunks = Math.ceil(items.length / chunk);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunk;
      const end = Math.min((i + 1) * chunk, items.length);

      const chunkFolderName = `part_${i + 1}`;
      const chunkFolderPath = path.join(out, chunkFolderName);
      if (!fs.existsSync(chunkFolderPath)) {
        fs.mkdirSync(chunkFolderPath, { recursive: true });
      }

      items.slice(start, end).forEach((file) => {
        if (file.type === 'file') {
          fs.copyFileSync(file.path, path.join(chunkFolderPath, path.basename(file.path)));
        }
      });
    }
  } else {
    items.forEach((file) => {
      fs.copyFileSync(file.path, path.join(out, path.basename(file.path)));
    });
  }
};
