import { DirectoryInfo } from './getDirectoryInfo';

export const consoleDirectoryInfo = (directoryInfo: DirectoryInfo) => {
  if (directoryInfo.items.length) {
    const exts = directoryInfo.items.reduce((counters, file) => {
      if (file.type === 'file') {
        const key = file.ext || 'Without extension';

        if (!counters[key]) {
          counters[key] = 0;
        }

        counters[key]++;
      }

      return counters;
    }, Object.create(null));

    console.table(directoryInfo.items);
    console.table(exts);
    console.table({
      'Files count': directoryInfo.filesCount,
      'Directories count': directoryInfo.directoriesCount,
      'Total count': directoryInfo.items.length,
    });
  } else {
    console.log('Not found...');
  }
};
