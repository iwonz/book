import { parseMetadataFromStringByRegExp } from '../../parseMetadataFromStringByRegExp';
import { validateFile } from '../../validateFile';
import { PdfEditableMetadata, PdfEditableMetadataKey, PdfMetadata } from '../types';
import { setPdfFileMetaData } from '../core/setPdfFileMetaData';
import { isValidFolder } from '../../isValidFolder';
import { getDirectoryInfo } from '../../getDirectoryInfo';
import path from 'path';

export const setPdfMetadata = async ({
  input,
  output = input,
  meta,
  recursive,
  pattern,
}: {
  input: string;
  output?: string;
  meta: PdfEditableMetadata;
  recursive?: boolean;
  pattern?: string | boolean;
}) => {
  const isCustomOutput = input !== output;

  if (isValidFolder(input)) {
    const directoryInfo = await getDirectoryInfo(recursive ? '**/*.+(pdf)' : '*.+(pdf)', {
      cwd: path.resolve(input),
      absolute: true,
      nodir: true,
      dot: false,
    });

    if (!directoryInfo.items.length) {
      return console.error(`🚨 PDF files not founded.`);
    }

    const results = await Promise.all(
      directoryInfo.items.map((item) => {
        let metadataFromFileName: PdfMetadata = {};
        if (pattern === true || typeof pattern === 'string') {
          metadataFromFileName = parseMetadataFromStringByRegExp(item.path, pattern === true ? undefined : pattern);
        }

        const itemOutput = isCustomOutput ? path.join(output, path.basename(item.path)) : item.path;

        return setPdfFileMetaData({
          input: item.path,
          output: itemOutput,
          meta: Object.keys(PdfEditableMetadataKey).reduce<PdfEditableMetadata>((store, key) => {
            // @ts-expect-error
            store[key] = metadataFromFileName[key] || meta[key];

            return store;
          }, {}),
        }).then((data) => {
          if (data.error) {
            console.error(`🚨 ${item.path} updating error.`, data.error);
          } else {
            console.log(
              isCustomOutput
                ? `✅ ${item.path} was moved to ${itemOutput} and updated.`
                : `✅ ${item.path} was updated.`,
            );
          }

          return data;
        });
      }),
    );

    let successed = 0;
    let failed = 0;
    results.forEach((data) => {
      if (data.error) {
        failed++;
      } else {
        successed++;
      }
    });

    console.log(`
📚 PDF files founded: ${directoryInfo.items.length}.
✅ PDF files updated: ${successed}.
🚨 PDF files not updated: ${failed}.
`);
  } else {
    const error = validateFile(input, '.pdf');
    if (error) {
      return console.error(error);
    }

    let metadataFromFileName: PdfMetadata = {};
    if (pattern === true || typeof pattern === 'string') {
      metadataFromFileName = parseMetadataFromStringByRegExp(input, pattern === true ? undefined : pattern);
    }

    const result = await setPdfFileMetaData({
      input,
      output,
      meta: Object.keys(PdfEditableMetadataKey).reduce<PdfEditableMetadata>((store, key) => {
        // @ts-expect-error
        store[key] = metadataFromFileName[key] || meta[key];

        return store;
      }, {}),
    });

    if (result.error) {
      console.error(`🚨 ${input} error.`, result.error);
    } else {
      console.log(isCustomOutput ? `✅ ${input} was moved to ${output} and updated.` : `✅ ${input} was updated.`);
    }
  }
};
