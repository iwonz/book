import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import { Parser, Builder } from 'xml2js';
import { PDFDocument } from 'pdf-lib';

export const parseZipFile = async (filePath: string) => {
  const file = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(file);

  return zip;
};

export const decodeEpub = async (
  filePath: string,
  output: string = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath))),
) => {
  const zip = await parseZipFile(filePath);

  await Promise.all(
    Object.keys(zip.files).map((key) => {
      const zFile = zip.files[key];

      const fullPath = path.join(output, zFile.name);
      const dirname = path.dirname(fullPath);

      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }

      if (!zFile.dir) {
        return zFile.async('nodebuffer').then(function (content) {
          fs.writeFileSync(fullPath, content);
        });
      }
    }),
  );
};

export const encodeEpub = async (input: string, output: string = path.join(path.basename(input), '.epub')) => {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'DEFLATE' });

  async function addFilesFromDirectory(folderPath: string, zipFolder: JSZip) {
    const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(folderPath, item.name);
      if (item.isDirectory()) {
        await addFilesFromDirectory(itemPath, zipFolder.folder(item.name) as JSZip);
      } else {
        const fileData = await fs.promises.readFile(itemPath);
        zipFolder.file(item.name, fileData, { compression: 'DEFLATE' });
      }
    }
  }

  await addFilesFromDirectory(input, zip);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });
  fs.writeFileSync(output, content);
};

export const getEpubOpfFiles = async (epubZip: JSZip) => {
  const opfFiles = await epubZip.file(new RegExp('content.opf', 'i'));

  if (!opfFiles.length) {
    return [];
  }

  const parser = new Parser();

  const contentOpfData = await Promise.all(
    opfFiles.map((file) => {
      return new Promise<{
        file: JSZip.JSZipObject;
        value: string;
      }>((resolve) => {
        file.async('string').then((value) => {
          resolve({
            file,
            value,
          });
        });
      });
    }),
  );

  return await Promise.all(
    contentOpfData.map((item) => {
      return new Promise<{
        file: JSZip.JSZipObject;
        value: any;
      }>(async (resolve) => {
        const value = await parser.parseStringPromise(item.value);

        resolve({
          file: item.file,
          value,
        });
      });
    }),
  );
};

export const modifyEpubMeta = async (
  filePath: string,
  {
    cleanCover = false,
  }: {
    cleanCover?: boolean;
  },
  output: string = filePath,
) => {
  const zip = await parseZipFile(filePath);
  const opfFiles = await getEpubOpfFiles(zip);

  if (opfFiles.length >= 2) {
    console.log(`⚠️ Founded ${opfFiles.length} opf for ${filePath}`);
  }

  opfFiles.forEach((opf) => {
    const opfValue = opf.value;
    const opfMetadata = opfValue.package.metadata[0];

    const meta: any = {
      $: opfMetadata['$'],
      'dc:creator': opfMetadata['dc:creator'],
      'dc:title': opfMetadata['dc:title'],
      'dc:language': opfMetadata['dc:language'],
    };

    const cover = opfMetadata['meta']?.find((item: any) => item['$']['name'] === 'cover');
    if (cover) {
      if (cleanCover) {
        const coverImagePath = opfValue.package.manifest[0]?.item?.find(
          (item: any) => item['$']['id'] === cover['$'].content,
        );
        if (coverImagePath) {
          opfValue.package.manifest[0].item = opfValue.package.manifest[0].item.filter(
            (item: any) => item['$']['id'] !== cover['$'].content,
          );

          if (opfValue.package.spine[0]?.itemref) {
            opfValue.package.spine[0].itemref = opfValue.package.spine[0].itemref.filter(
              (item: any) => item['$']['idref'] !== cover['$'].content,
            );
          }

          zip.remove(coverImagePath['$']['href']);
        }

        const coverHtmlPath = opfValue.package.guide?.[0]?.reference?.find(
          (item: any) => item['$']['type'] === 'cover',
        )?.['$']['href'];
        if (coverHtmlPath) {
          opfValue.package.guide[0].reference = opfValue.package.guide[0].reference.filter(
            (item: any) => item['$']['type'] !== 'cover',
          );

          zip.remove(coverHtmlPath);
        }

        const coverHtmlPath2 = opfValue.package.manifest[0]?.item?.find((item: any) => item['$']['id'] === 'cover')?.[
          '$'
        ]['href'];
        if (coverHtmlPath2) {
          opfValue.package.manifest[0].item = opfValue.package.manifest[0].item.filter(
            (item: any) => item['$']['id'] !== 'cover',
          );

          if (opfValue.package.spine[0]?.itemref) {
            opfValue.package.spine[0].itemref = opfValue.package.spine[0].itemref.filter(
              (item: any) => item['$']['idref'] !== 'cover',
            );
          }

          zip.remove(coverHtmlPath2);
        }
      } else {
        meta['meta'] = cover;
      }
    }

    opfValue.package.metadata[0] = meta;

    const builder = new Builder({
      headless: true,
    });
    const updatedOpfXML = builder.buildObject(opfValue);

    zip.file(opf.file.name, updatedOpfXML);
  });

  const newZip = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  fs.writeFileSync(output, newZip);
};

export const epubFileNameAuthorTitleToMetadata = async (file: string, output: string = file) => {
  const zip = await parseZipFile(file);
  const opfFiles = await getEpubOpfFiles(zip);

  const fileName = path.basename(file, path.extname(file));
  const [authorsPart, ...title] = fileName.split(' - ');
  const authors = authorsPart.split(',').map((author) => author.trim());

  if (opfFiles.length >= 2) {
    console.log(`⚠️ Founded ${opfFiles.length} opf for ${file}`);
  }

  opfFiles.forEach((opf) => {
    const opfValue = opf.value;

    opfValue.package.metadata[0]['dc:creator'] = [{ _: authors.join(', '), $: { 'opf:role': 'aut' } }];
    opfValue.package.metadata[0]['dc:title'] = [{ _: title.join(' - ').trim() }];

    const builder = new Builder({
      renderOpts: { pretty: true },
      headless: true,
    });
    const updatedOpfXML = builder.buildObject(opfValue);

    zip.file(opf.file.name, updatedOpfXML);
  });

  const newZip = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  fs.writeFileSync(output, newZip);
};
