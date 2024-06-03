import { PdfMetadata } from '../types';

export const consolePdfMetadata = (pdfMetadata: PdfMetadata) => {
  if (Object.keys(pdfMetadata).length) {
    const metadata = JSON.parse(
      JSON.stringify({
        ...pdfMetadata,
        pages: null,
        pageIndices: null,
        form: null,
      }),
    );

    delete metadata.pages;
    delete metadata.pageIndices;
    delete metadata.form;

    console.table(metadata);
  }
};
