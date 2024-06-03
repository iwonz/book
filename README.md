# What?

`tong` (Wan Shi Tong) - A tool for organizing an electronic library. Automation of sorting, optimization of book size,
fine work with book
metadata, systematization of titles.

# Using as global CLI

`npm install -g @iwonz/tong`

After this you can call `tong` command directly from your console, everywhere.

# Using once with npx

`npx @iwonz/tong %COMMAND%`

# Using as package on your own source code

`yarn add @iwonz/tong`

# Commands for working with PDF files

All command for working with PDF files are living in `tong pdf` section.

PdfEditableMetadata:

- author
- title
- creator
- producer
- subject
- keywords
- creationDate
- modificationDate

`tong pdf get 1.pdf` - Print table with `PdfEditableMetadata` fields and `pagesCount` field from `1.pdf` file.
Fields `pages`, `pageIndices` and `form` will be excluded from table because they are not helpfully and very big.

`tong pdf clean 1.pdf` - Clean all `PdfEditableMetadata` fields from `1.pdf` file.

`tong pdf clean 1.pdf 2.pdf` - Copy `1.pdf` file content to `2.pdf` file and clean all `PdfEditableMetadata` fields
from `2.pdf` file.

`tong pdf clean folder` - Not recursively found all `.pdf` files in `folder` folder and clean all `PdfEditableMetadata`
fields on them.

`tong pdf clean folder -r` - Recursively found all `.pdf` files in `folder` folder and clean all `PdfEditableMetadata`
fields on them.

`tong pdf clean folder folder2` - Not recursively found all `.pdf` files in `folder` folder, copy them to `folder2`
folder and clean
all `PdfEditableMetadata` fields on them.

`tong pdf clean folder folder2 -r` - Recursively found all `.pdf` files in `folder` folder, copy them to `folder2`
folder flat structure and
clean
all `PdfEditableMetadata` fields on them.

# Commands for working with EPUB files

`tong epub get 1.epub` - Print table with metadata (opf files) of `1.epub` file.

`tong epub encode folder` - Encode (zip/archive) `folder` folder with `epub` sources to `folder.epub` file.

`tong epub encode folder 1.epub` - Encode (zip/archive) `folder` folder with `epub` sources to `1.epub` file.

`tong epub encode folder -f` - Encode (zip/archive) `folder` folder with `epub` sources to `1.epub` file.

`tong epub decode 1.epub` - Decode (unzip/unarchive) `1.epub` file sources to `1` folder.

