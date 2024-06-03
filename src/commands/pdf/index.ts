import { getPdfFileMetadata } from '../../utils/pdf/core/getPdfFileMetadata';
import { consolePdfMetadata } from '../../utils/pdf/utils/consolePdfMetadata';
import prompts, { PromptType } from 'prompts';
import { setPdfMetadata } from '../../utils/pdf/utils/setPdfMetadata';
import { Command } from 'commander';
import {
  DEFAULT_AUTHOR_AND_TITLE_REGEXP,
  parseMetadataFromStringByRegExp,
} from '../../utils/parseMetadataFromStringByRegExp';
import { validateFile } from '../../utils/validateFile';
import { PDF_EMPTY_META } from '../../utils/pdf/constants';

export default function (program: Command) {
  const pdf = program.command('pdf').description('PDF utils.');

  pdf
    .command('get <input>')
    .description('Get PDF metadata.')
    .action(async (input) => {
      const { error, pdfMeta } = await getPdfFileMetadata(input);
      if (error) {
        return console.error(error);
      }

      consolePdfMetadata(pdfMeta);
    });

  pdf
    .command('set <input> [output]')
    .option(
      '--pattern [value]',
      `Use RegExp pattern for parsing metadata from filename.
      If --pattern without [value] default ${DEFAULT_AUTHOR_AND_TITLE_REGEXP} will be used.
      For example: ${DEFAULT_AUTHOR_AND_TITLE_REGEXP} will parse 'Fyodor Dostoevsky - Demons' to { author: 'Fyodor Dostoevsky', title: 'Demons' }
      Use ES2018 Named RegExp Group syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group).
      Available fields to parse:
        - author
        - title
        - creator
        - producer
        - subject
        - keywords
        - creationDate
        - modificationDate`,
    )
    .description('Set PDF metadata.')
    .action(async (input, output, options) => {
      const error = validateFile(input, '.pdf');
      if (error) {
        return console.error(error);
      }

      let metadataFromFileName = {};
      if (options.pattern === true || typeof options.pattern === 'string') {
        const pattern = options.pattern === true ? undefined : options.pattern;
        metadataFromFileName = parseMetadataFromStringByRegExp(input, pattern);
      }

      const pdfMetadata = await getPdfFileMetadata(input);

      const pdfMetaKeys = [
        'author',
        'title',
        'creator',
        'producer',
        'subject',
        'keywords',
        'creationDate',
        'modificationDate',
      ];

      const answers = await prompts(
        pdfMetaKeys.map((pdfMetaKey) => {
          let type: PromptType = 'text';
          if (pdfMetaKey === 'creationDate' || pdfMetaKey === 'modificationDate') {
            type = 'date';
          }

          // @ts-ignore
          let initial = metadataFromFileName[pdfMetaKey] || pdfMetadata[pdfMetaKey];
          if (type === 'date') {
            // @ts-ignore
            initial = new Date(pdfMetadata[pdfMetaKey] || 0);
          }

          return {
            type,
            name: pdfMetaKey,
            message: pdfMetaKey,
            initial,
          };
        }),
      );

      if (Object.keys(answers).length) {
        await setPdfMetadata({
          input,
          output,
          meta: answers,
        });
      } else {
        console.log('🚨 Please, set metadata to update.');
      }
    });

  pdf
    .command('clean <input> [output]')
    .description(
      `Clean <input> PDF file.
        [output] is equal <input> by default. So it means that original <input> file will be changed.
        It will clean all PDF files in folder if <input> is path to folder. Use -r, --recursive to do it recursive.
        It will flat all PDF files to [output] directory if it exists and <input> is path to folder.`,
    )
    .option('-r, --recursive', 'Get all PDF files recursive if <input> is folder.')
    .action(async (input, output, options) => {
      await setPdfMetadata({ input, output, meta: PDF_EMPTY_META, recursive: options?.recursive });
    });
}
