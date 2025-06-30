import slugify from 'slugify';

export const generateHandle = (s: string) => {
  return slugify(s, {
    trim: true,
    lower: true,
    locale: 'en',
    replacement: '-',
  });
};
