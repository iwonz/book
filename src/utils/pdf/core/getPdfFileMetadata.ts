import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { PdfMetadata } from '../types';
import { validateFile } from '../../validateFile';

export const getPdfFileMetadata = async (
  input: string | PDFDocument,
): Promise<{ error?: any; pdfMeta: PdfMetadata }> => {
  let pdfDoc: PDFDocument | null = null;

  if (typeof input === 'string') {
    const error = validateFile(input, '.pdf');
    if (error) {
      return { error, pdfMeta: {} };
    }

    try {
      const pdfFile = fs.readFileSync(input);
      pdfDoc = await PDFDocument.load(pdfFile);
    } catch (error) {
      return { error, pdfMeta: {} };
    }
  } else {
    pdfDoc = input;
  }

  return {
    error: false,
    pdfMeta: {
      author: pdfDoc?.getAuthor(),
      title: pdfDoc?.getTitle(),
      creator: pdfDoc?.getCreator(),
      producer: pdfDoc?.getProducer(),
      subject: pdfDoc?.getSubject(),
      keywords: pdfDoc?.getKeywords(),
      creationDate: pdfDoc?.getCreationDate(),
      modificationDate: pdfDoc?.getModificationDate(),
      pageCount: pdfDoc?.getPageCount(),
      pages: pdfDoc?.getPages(),
      pageIndices: pdfDoc?.getPageIndices(),
      form: pdfDoc?.getForm(),
    },
  };
};
