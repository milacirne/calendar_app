import { ChevronLeft, ChevronRight } from "lucide-react";
import { MAX_YEAR, MIN_YEAR } from "../data/calendarConfig";
import { getYearRanges, getYearsInRange } from "../utils/calendar";

interface YearNavigatorProps {
  year: number;
  onYearChange: (year: number) => void;
}

export function YearNavigator({ year, onYearChange }: YearNavigatorProps) {
  const ranges = getYearRanges();
  const activeRange = ranges.find((range) => year >= range.start && year <= range.end) ?? ranges[ranges.length - 1];
  const years = getYearsInRange(activeRange.start, activeRange.end);

  return (
    <section className="year-navigator" aria-label="Navegação de ano">
      <button
        className="icon-button"
        type="button"
        aria-label="Ano anterior"
        title="Ano anterior"
        disabled={year <= MIN_YEAR}
        onClick={() => onYearChange(year - 1)}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="year-current">
        <span>{year} d.T.</span>
      </div>

      <button
        className="icon-button"
        type="button"
        aria-label="Próximo ano"
        title="Próximo ano"
        disabled={year >= MAX_YEAR}
        onClick={() => onYearChange(year + 1)}
      >
        <ChevronRight size={20} />
      </button>

      <label className="field compact-field">
        <span>Intervalo</span>
        <select
          value={activeRange.label}
          onChange={(event) => {
            const selectedRange = ranges.find((range) => range.label === event.target.value);
            if (selectedRange) {
              onYearChange(selectedRange.end);
            }
          }}
        >
          {ranges.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label}
            </option>
          ))}
        </select>
      </label>

      <div className="year-grid" aria-label="Escolher ano">
        {years.map((rangeYear) => (
          <button
            className={rangeYear === year ? "year-chip active" : "year-chip"}
            type="button"
            key={rangeYear}
            onClick={() => onYearChange(rangeYear)}
          >
            {rangeYear}
          </button>
        ))}
      </div>
    </section>
  );
}
