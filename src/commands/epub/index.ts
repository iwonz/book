import { Command } from 'commander';
import {
  decodeEpub,
  encodeEpub,
  epubFileNameAuthorTitleToMetadata,
  getEpubOpfFiles,
  modifyEpubMeta,
  parseZipFile,
} from '../../utils/epub';
import { getDirectoryInfo } from '../../utils/getDirectoryInfo';
import path from 'path';
import { consoleDirectoryInfo } from '../../utils/consoleDirectoryInfo';

export default function (program: Command) {
  const epub = program.command('epub').description('EPUB utils.');

  epub
    .command('decode <file>')
    .description('Decode epub zip file to output folder')
    .option('-o, --output <pattern>', 'Dir where will be decoded epub file')
    .action(async (file, options) => {
      await decodeEpub(file, options.output);
    });

  epub
    .command('encode <input>')
    .description('Encode folder with epub book to epub file')
    .option('-o, --output <pattern>', 'Epub file name')
    .action(async (input, options) => {
      await encodeEpub(input, options.output);
    });

  epub
    .command('rename <input>')
    .description('Encode folder with epub book to epub file')
    .option('-o, --output <pattern>', 'Epub file name')
    .option('-a, --all', 'All in folder')
    .action(async (input, options) => {
      if (options.all) {
        const directoryInfo = await getDirectoryInfo('**/*.+(epub)', {
          cwd: path.resolve(input),
          absolute: true,
          nodir: false,
          dot: true,
        });

        consoleDirectoryInfo(directoryInfo);

        await Promise.all(
          directoryInfo.items.map((file) => {
            return epubFileNameAuthorTitleToMetadata(file.path, options.output);
          }),
        );
      } else {
        await epubFileNameAuthorTitleToMetadata(input, options.output);
      }
    });

  epub
    .command('clean <input>')
    .description('Clean epub metadata')
    .option('-o, --output <pattern>', 'Output dir')
    .option('-a, --all', 'All in folder')
    .option('--cleanCover', 'Clean cover')
    .action(async (input, options) => {
      if (options.all) {
        const directoryInfo = await getDirectoryInfo('**/*.+(epub)', {
          cwd: path.resolve(input),
          absolute: true,
          nodir: false,
          dot: true,
        });

        consoleDirectoryInfo(directoryInfo);

        await Promise.all(
          directoryInfo.items.map((file) => {
            return modifyEpubMeta(
              file.path,
              {
                cleanCover: options.cleanCover,
              },
              options.output,
            );
          }),
        );
      } else {
        await modifyEpubMeta(
          input,
          {
            cleanCover: options.cleanCover,
          },
          options.output,
        );
      }
    });

  epub
    .command('getInfo <file>')
    .description('Get epub opf file info')
    .action(async (file) => {
      const zip = await parseZipFile(file);

      const opfFiles = await getEpubOpfFiles(zip);

      if (opfFiles.length) {
        opfFiles.forEach((opf) => {
          console.log(JSON.stringify(opf.value, null, 2));
        });
      } else {
        console.log('No info...');
      }
    });
}
