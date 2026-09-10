'use client';

import React from 'react';
import { CalendarEvent, User, Calendar } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { Lock, Plus, MapPin } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  currentUser: User;
  activeCalendar: Calendar | null;
  calendars: Calendar[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  currentUser,
  activeCalendar,
  calendars,
  onSelectEvent,
  onSelectDate,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const calendarMap = new Map(calendars.map((c) => [c.calendar_id, c]));

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center py-2.5 text-xs font-semibold text-slate-400">
        <span className="text-rose-400">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span className="text-blue-400">토</span>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-950/30 divide-x divide-y divide-slate-800/60">
        {days.map((day, idx) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          // Get events for this day
          const dayEvents = events.filter((ev) => {
            const evDate = format(parseISO(ev.start_time), 'yyyy-MM-dd');
            return evDate === dayStr;
          });

          return (
            <div
              key={dayStr}
              onClick={() => onSelectDate(day)}
              className={`min-h-[110px] p-1.5 flex flex-col group cursor-pointer transition-colors relative hover:bg-slate-800/40 ${
                !isCurrentMonth ? 'opacity-40 bg-slate-950/40' : ''
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1 px-1">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isCurrentDay
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : idx % 7 === 0
                      ? 'text-rose-400'
                      : idx % 7 === 6
                      ? 'text-blue-400'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(day);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400 transition-opacity p-0.5 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Events List */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] pr-0.5">
                {dayEvents.map((ev) => {
                  const cal = calendarMap.get(ev.calendar_id);
                  const isCreator = ev.creator_id === currentUser.user_id;

                  // EVENT-02: Privacy setting - if private and not creator, mask title as "바쁨"
                  const displayTitle = ev.is_private && !isCreator ? '🔒 바쁨 (Busy)' : ev.title;
                  const color = cal?.color_code || '#3B82F6';

                  return (
                    <div
                      key={ev.event_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      style={{ borderLeftColor: color }}
                      className={`text-[11px] p-1 px-1.5 rounded border-l-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 truncate cursor-pointer transition-all flex items-center justify-between gap-1 shadow-sm ${
                        ev.is_private && !isCreator ? 'opacity-70 italic' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {ev.is_private && <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                        <span className="truncate">{displayTitle}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {ev.is_all_day ? '종일' : format(parseISO(ev.start_time), 'HH:mm')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
