import fs from 'fs';

export const isValidFolder = (input: string) => {
  try {
    const stats = fs.statSync(input);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
};
