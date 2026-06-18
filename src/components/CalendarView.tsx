'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Check } from 'lucide-react';

interface CalendarViewProps {
  year: number;
  month: number;
  visitDates: string[]; // Array of 'YYYY-MM-DD'
  onDateClick?: (date: string) => void;
}

export default function CalendarView({
  year,
  month,
  visitDates,
  onDateClick,
}: CalendarViewProps) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  // Pad days array with previous month's days to fill first week
  const startDay = start.getDay();
  const prevMonthStart = new Date(year, month - 1, 0);
  const prevMonthDays = eachDayOfInterval({
    start: new Date(year, month - 2, prevMonthStart.getDate() - startDay + 1),
    end: prevMonthStart,
  });

  const allDays = [...prevMonthDays, ...days];

  // Pad with next month's days if needed
  while (allDays.length % 7 !== 0) {
    allDays.push(
      new Date(year, month, allDays.length - prevMonthDays.length - days.length + 1)
    );
  }

  const visitDateSet = new Set(visitDates);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-bg-card border border-border rounded-lg p-4">
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-text-muted">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((date, idx) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(date, new Date(year, month - 1));
          const isVisited = visitDateSet.has(dateStr);
          const isToday = dateStr === today && isCurrentMonth;

          return (
            <button
              key={idx}
              onClick={() => onDateClick?.(dateStr)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-colors relative
                ${!isCurrentMonth ? 'text-text-muted bg-bg-primary' : ''}
                ${isCurrentMonth && !isVisited && !isToday ? 'text-text-primary bg-bg-card-hover hover:bg-border' : ''}
                ${isVisited ? 'bg-accent text-bg-primary' : ''}
                ${isToday && !isVisited ? 'ring-2 ring-accent text-accent' : ''}
              `}
            >
              {isVisited ? (
                <>
                  <Check size={16} className="absolute" />
                </>
              ) : (
                format(date, 'd')
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
