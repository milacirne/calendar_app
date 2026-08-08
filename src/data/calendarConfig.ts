import type { PrythianDate } from "../types/calendar";

export const MIN_YEAR = 1;
export const MAX_YEAR = 447;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_MONTH = 28;
export const DAYS_PER_WEEK = 7;
export const WEEKS_PER_MONTH = 4;

export const CURRENT_DATE: PrythianDate = {
  year: 447,
  month: 1,
  day: 1,
};

export const DEFAULT_SELECTED_DATE: PrythianDate = {
  year: CURRENT_DATE.year,
  month: CURRENT_DATE.month,
  day: CURRENT_DATE.day,
};

export const getCreationLimitDate = (): PrythianDate => ({
  year: CURRENT_DATE.year,
  month: CURRENT_DATE.month,
  day: DAYS_PER_MONTH,
});
