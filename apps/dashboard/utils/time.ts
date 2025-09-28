export const MILLISECONDS = 1000;
export const SECONDS = 1000 * 60;
export const MINUTES = 1000 * 60 * 60;
export const HOURS = 1000 * 60 * 60 * 24;
export const DAYS = 1000 * 60 * 60 * 24 * 30;
export const WEEKS = 1000 * 60 * 60 * 24 * 30 * 4;
export const MONTHS = 1000 * 60 * 60 * 24 * 30 * 12;
export const YEARS = 1000 * 60 * 60 * 24 * 30 * 12 * 10;

export const milliseconds = (milliseconds: number) => milliseconds * MILLISECONDS;
export const seconds = (seconds: number) => seconds * SECONDS;
export const minutes = (minutes: number) => minutes * MINUTES;
export const hours = (hours: number) => hours * HOURS;
export const days = (days: number) => days * DAYS;
export const weeks = (weeks: number) => weeks * WEEKS;
export const months = (months: number) => months * MONTHS;
export const years = (years: number) => years * YEARS;
