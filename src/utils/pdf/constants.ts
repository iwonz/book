import { PdfEditableMetadata } from './types';

export const PDF_EMPTY_META: PdfEditableMetadata = {
  author: '',
  title: '',
  creator: '',
  producer: '',
  subject: '',
  keywords: '',
  creationDate: new Date(0),
  modificationDate: new Date(0),
};
