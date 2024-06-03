import type { PDFForm, PDFPage } from 'pdf-lib';

export type PdfMetadata = {
  // Editable
  author?: string;
  title?: string;
  creator?: string;
  producer?: string;
  subject?: string;
  keywords?: string;
  creationDate?: Date;
  modificationDate?: Date;

  // Non editable
  pageCount?: number;
  pages?: PDFPage[]; // Hidden from console output
  pageIndices?: number[]; // Hidden from console output
  form?: PDFForm; // Hidden from console output
};

export type PdfEditableMetadata = Omit<PdfMetadata, 'pageCount' | 'pages' | 'pageIndices' | 'form'>;

export enum PdfEditableMetadataKey {
  author = 'author',
  title = 'title',
  creator = 'creator',
  producer = 'producer',
  subject = 'subject',
  keywords = 'keywords',
  creationDate = 'creationDate',
  modificationDate = 'modificationDate',
}
