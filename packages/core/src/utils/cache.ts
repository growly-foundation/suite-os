export const second = (seconds: number) => seconds * 1000;
export const minute = (minutes: number) => minutes * second(60);
export const hour = (hours: number) => hours * minute(60);
export const day = (days: number) => days * hour(24);
export const week = (weeks: number) => weeks * day(7);
export const month = (months: number) => months * day(30);
export const year = (years: number) => years * day(365);

export const isStale = (date: string, staleDuration: number): boolean => {
  return date < new Date(Date.now() - staleDuration).toISOString();
};
