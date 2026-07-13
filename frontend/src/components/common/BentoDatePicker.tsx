"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  parseISO,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i, 1), "MMM"));
const YEAR_GRID_SIZE = 12;

type CalendarView = "days" | "months" | "years";

interface BentoDatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function buildCalendarWeeks(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function BentoDatePicker({ id, value, onChange, placeholder }: BentoDatePickerProps): React.JSX.Element {
  const selectedDate = value ? parseISO(value) : null;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("days");
  const [viewMonth, setViewMonth] = useState<Date>(selectedDate ?? new Date());
  const [yearRangeStart, setYearRangeStart] = useState<number>(
    () => Math.floor((selectedDate ?? new Date()).getFullYear() / YEAR_GRID_SIZE) * YEAR_GRID_SIZE,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) setView("days");
  }, [open]);

  const weeks = useMemo(() => buildCalendarWeeks(viewMonth), [viewMonth]);
  const displayValue = selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";
  const years = useMemo(
    () => Array.from({ length: YEAR_GRID_SIZE }, (_, i) => yearRangeStart + i),
    [yearRangeStart],
  );

  const handleSelectDay = (day: Date): void => {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleToday = (): void => {
    const today = new Date();
    onChange(format(today, "yyyy-MM-dd"));
    setViewMonth(today);
    setYearRangeStart(Math.floor(today.getFullYear() / YEAR_GRID_SIZE) * YEAR_GRID_SIZE);
    setOpen(false);
  };

  const handleSelectMonth = (monthIndex: number): void => {
    setViewMonth((month) => setMonth(month, monthIndex));
    setView("days");
  };

  const handleSelectYear = (year: number): void => {
    setViewMonth((month) => setYear(month, year));
    setView("months");
  };

  const openMonthPicker = (): void => {
    setYearRangeStart(Math.floor(viewMonth.getFullYear() / YEAR_GRID_SIZE) * YEAR_GRID_SIZE);
    setView("months");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5
                  text-sm outline-none transition-all duration-200
                  focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ed017f]"
      >
        <span className={displayValue ? "text-gray-700" : "text-gray-300"}>{displayValue || placeholder || "dd/mm/yyyy"}</span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
          {view === "days" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMonth((month) => subMonths(month, 1))}
                  aria-label="Previous month"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={openMonthPicker}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100"
                >
                  {format(viewMonth, "MMMM yyyy")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth((month) => addMonths(month, 1))}
                  aria-label="Next month"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day) => (
                  <span key={day} className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weeks.flat().map((day) => {
                  const inMonth = isSameMonth(day, viewMonth);
                  const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const todayDate = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={!inMonth}
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                        !inMonth && "pointer-events-none text-gray-200",
                        inMonth && !selected && "text-gray-700 hover:bg-[#FFE6F4]",
                        selected && "bg-[#ed017f] text-white",
                        !selected && todayDate && inMonth && "border border-[#ed017f] text-[#ed017f]",
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
                >
                  Clear
                </button>
                <button type="button" onClick={handleToday} className="text-xs font-semibold text-[#ed017f] hover:underline">
                  Today
                </button>
              </div>
            </>
          )}

          {view === "months" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMonth((month) => subYears(month, 1))}
                  aria-label="Previous year"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("years")}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100"
                >
                  {format(viewMonth, "yyyy")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth((month) => addYears(month, 1))}
                  aria-label="Next year"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MONTH_LABELS.map((label, index) => {
                  const selected = index === viewMonth.getMonth();
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSelectMonth(index)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                        selected ? "bg-[#ed017f] text-white" : "text-gray-700 hover:bg-[#FFE6F4]",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === "years" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setYearRangeStart((start) => start - YEAR_GRID_SIZE)}
                  aria-label="Previous years"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  {years[0]} - {years[years.length - 1]}
                </span>
                <button
                  type="button"
                  onClick={() => setYearRangeStart((start) => start + YEAR_GRID_SIZE)}
                  aria-label="Next years"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => {
                  const selected = isSameYear(new Date(year, 0, 1), viewMonth);
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleSelectYear(year)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                        selected ? "bg-[#ed017f] text-white" : "text-gray-700 hover:bg-[#FFE6F4]",
                      )}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
