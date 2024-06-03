import fs from 'fs';
import path from 'path';

export const validateFile = (input: string, ext: string | null = null) => {
  if (!fs.existsSync(input)) {
    return '🚨 File does not exists.';
  }

  if (ext && path.extname(input) !== ext) {
    return `🚨 ${ext} extension was expected.`;
  }

  return false;
};
