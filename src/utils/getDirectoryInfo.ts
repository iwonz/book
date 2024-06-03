import fs from 'fs';
import path from 'path';
import type { GlobOptions } from 'glob';
import { glob } from 'glob';

export interface DirectoryInfoItem {
  type: 'directory' | 'file';
  path: string;
  ext?: string;
}

export interface DirectoryInfo {
  filesCount: number;
  directoriesCount: number;
  items: DirectoryInfoItem[];
}

export const getDirectoryInfo = async (
  pattern: string = '*',
  options: GlobOptions = {
    cwd: path.resolve(process.cwd()),
    absolute: true,
    nodir: false,
    dot: true,
  },
): Promise<DirectoryInfo> => {
  const files = await glob(pattern, options as Object);

  return files.reduce<DirectoryInfo>(
    (directoryInfo, file) => {
      const stats = fs.statSync(file);

      if (stats.isDirectory()) {
        directoryInfo.directoriesCount++;

        directoryInfo.items.push({ type: 'directory', path: file });
      } else if (stats.isFile()) {
        directoryInfo.filesCount++;

        const ext = path.extname(file);
        directoryInfo.items.push({ type: 'file', path: file, ext });
      }

      return directoryInfo;
    },
    {
      filesCount: 0,
      directoriesCount: 0,
      items: [],
    },
  );
};
