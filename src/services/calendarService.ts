import { CURRENT_DATE, getCreationLimitDate, MAX_YEAR, MIN_YEAR } from "../data/calendarConfig";
import { months } from "../data/months";
import { weekdays } from "../data/weekdays";
import { lunarWeeks } from "../data/lunarWeeks";

export async function getCalendarMetadata() {
  return {
    months,
    weekdays,
    lunarWeeks,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    currentDate: CURRENT_DATE,
    creationLimitDate: getCreationLimitDate(),
  };
}
