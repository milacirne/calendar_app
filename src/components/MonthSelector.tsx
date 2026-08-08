import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { CURRENT_DATE, MAX_YEAR, MIN_YEAR } from "../data/calendarConfig";
import { months, seasons } from "../data/months";
import type { CalendarEvent, PrythianDate } from "../types/calendar";
import { getNextMonth, getPreviousMonth } from "../utils/calendar";
import { RegisteredRpsNavigator } from "./RegisteredRpsNavigator";

interface MonthSelectorProps {
  selectedDate: PrythianDate;
  events: CalendarEvent[];
  onDateChange: (date: PrythianDate) => void;
}

export function MonthSelector({ selectedDate, events, onDateChange }: MonthSelectorProps) {
  const isAtOrAfterCurrentPeriod =
    selectedDate.year > CURRENT_DATE.year ||
    (selectedDate.year === CURRENT_DATE.year && selectedDate.month >= CURRENT_DATE.month);
  const isAtLastAvailableMonth = selectedDate.year === MAX_YEAR && selectedDate.month === 12;
  const isNextMonthDisabled = isAtOrAfterCurrentPeriod || isAtLastAvailableMonth;
  const nextMonthTooltip = isAtOrAfterCurrentPeriod
    ? "Indisponível: o calendário já está no período atual do fórum."
    : "Próximo mês";

  const moveMonth = (direction: "previous" | "next") => {
    const nextMonth = direction === "previous" ? getPreviousMonth(selectedDate) : getNextMonth(selectedDate);
    onDateChange({
      year: nextMonth.year,
      month: nextMonth.month,
      day: 1,
    });
  };

  return (
    <section className="month-selector" aria-label="Navegação de mês">
      <div className="month-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={selectedDate.year === MIN_YEAR && selectedDate.month === 1}
          onClick={() => moveMonth("previous")}
        >
          <ChevronLeft size={18} />
          Mês anterior
        </button>
        <button className="secondary-button" type="button" onClick={() => onDateChange(CURRENT_DATE)}>
          <RotateCcw size={17} />
          Mês atual
        </button>
        <span className="disabled-tooltip-wrapper" title={nextMonthTooltip}>
          <button
            className="secondary-button"
            type="button"
            disabled={isNextMonthDisabled}
            onClick={() => moveMonth("next")}
          >
            Próximo mês
            <ChevronRight size={18} />
          </button>
        </span>
      </div>

      <label className="field">
        <span>Mês</span>
        <select
          value={selectedDate.month}
          onChange={(event) => onDateChange({ ...selectedDate, month: Number(event.target.value), day: 1 })}
        >
          {seasons.map((season) => {
            const filteredMonths = months
              .filter((month) => month.season === season)
              .filter((month) => !(selectedDate.year === CURRENT_DATE.year && month.id > CURRENT_DATE.month));

            return filteredMonths.length > 0 ? (
              <optgroup key={season} label={season}>
                {filteredMonths.map((month) => (
                  <option key={month.id} value={month.id}>
                    {month.id}. {month.name}
                  </option>
                ))}
              </optgroup>
            ) : null;
          })}
        </select>
      </label>

      <RegisteredRpsNavigator events={events} onNavigate={onDateChange} />
    </section>
  );
}
