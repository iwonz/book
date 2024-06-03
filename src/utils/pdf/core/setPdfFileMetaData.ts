import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { PdfEditableMetadata } from '../types';

export const setPdfFileMetaData = async ({
  input,
  output = input,
  meta,
}: {
  input: string;
  output?: string;
  meta: PdfEditableMetadata;
}) => {
  try {
    const pdfFile = fs.readFileSync(input);
    const pdfDoc = await PDFDocument.load(pdfFile);

    if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
    if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
    if (meta.creator !== undefined) pdfDoc.setCreator(meta.creator);
    if (meta.producer !== undefined) pdfDoc.setProducer(meta.producer);
    if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
    if (meta.keywords !== undefined)
      pdfDoc.setKeywords(meta.keywords?.split(',').map((keyword) => keyword.trim()) || []);
    if (meta.creationDate !== undefined) pdfDoc.setCreationDate(meta.creationDate);
    if (meta.modificationDate !== undefined) pdfDoc.setModificationDate(meta.modificationDate);

    const updatedPdfFile = await pdfDoc.save();

    let outDir = path.dirname(output);
    let outFileName = path.basename(output, path.extname(output));

    if (input !== output) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outDir, `${outFileName}.pdf`), updatedPdfFile);

    return { error: false };
  } catch (error) {
    return { error };
  }
};
