export const MILLISECONDS = 1;
export const SECONDS = MILLISECONDS * 1000;
export const MINUTES = SECONDS * 60;
export const HOURS = MINUTES * 60;
export const DAYS = HOURS * 24;
export const WEEKS = DAYS * 7;
export const MONTHS = DAYS * 30;
export const YEARS = DAYS * 365;

export const milliseconds = (value: number) => value * MILLISECONDS;
export const seconds = (value: number) => value * SECONDS;
export const minutes = (value: number) => value * MINUTES;
export const hours = (value: number) => value * HOURS;
export const days = (value: number) => value * DAYS;
export const weeks = (value: number) => value * WEEKS;
export const months = (value: number) => value * MONTHS;
export const years = (value: number) => value * YEARS;
