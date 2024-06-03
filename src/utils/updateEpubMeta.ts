import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { parseMetadataFromStringByRegExp } from './parseMetadataFromStringByRegExp';

export const updateEpubMeta = async (
  input: string,
  {
    author,
    title,
  }: {
    author: string;
    title: string;
  },
  output = input,
) => {
  const bookInfo = parseMetadataFromStringByRegExp(input);

  let bookAuthor = author || bookInfo.author;
  let bookTitle = title || bookInfo.title;

  const pdfFile = fs.readFileSync(input);
  try {
    const pdfDoc = await PDFDocument.load(pdfFile);

    pdfDoc.setAuthor(bookAuthor);
    pdfDoc.setTitle(bookTitle);

    const updatedPdfFile = await pdfDoc.save();
    fs.writeFileSync(output, updatedPdfFile);

    console.log(`✅`);
    console.table({
      bookAuthor,
      bookTitle,
    });
  } catch (error) {
    console.error(`🚨`, error);
  }
};
