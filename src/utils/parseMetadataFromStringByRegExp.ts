import path from 'path';

export const DEFAULT_AUTHOR_AND_TITLE_REGEXP = `^(?<author>.*)\\s-\\s(?<title>.*)$`;

export const parseMetadataFromStringByRegExp = (
  input: string,
  pattern: RegExp | string = DEFAULT_AUTHOR_AND_TITLE_REGEXP,
): Record<string, any> => {
  const regExp = new RegExp(pattern);

  const raw = path.basename(input, path.extname(input));
  const match = raw.match(regExp);

  if (match?.groups) {
    return Object.keys(match.groups).reduce(
      (data, key) => {
        data[key] = match.groups?.[key]?.trim() || '';

        return data;
      },
      {} as Record<string, any>,
    );
  }

  return {};
};
