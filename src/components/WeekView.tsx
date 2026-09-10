'use client';

import React from 'react';
import { CalendarEvent, User, Calendar } from '@/types';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { Lock } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  currentUser: User;
  calendars: Calendar[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export function WeekView({
  currentDate,
  events,
  currentUser,
  calendars,
  onSelectEvent,
  onSelectDate,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const calendarMap = new Map(calendars.map((c) => [c.calendar_id, c]));

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-950/60 text-center py-2.5 text-xs font-semibold text-slate-400">
        <div className="w-14 border-r border-slate-800 text-[11px] text-slate-500 py-1">시간</div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className="cursor-pointer hover:text-white transition-colors py-0.5"
          >
            <div className="text-[11px] text-slate-400">{format(day, 'E', { locale: ko })}</div>
            <div
              className={`inline-block font-bold text-sm px-2 py-0.5 rounded-full ${
                isToday(day) ? 'bg-amber-500 text-slate-950' : 'text-slate-200'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Grid */}
      <div className="flex-1 overflow-y-auto flex">
        {/* Time Column */}
        <div className="w-14 shrink-0 bg-slate-950/40 border-r border-slate-800 flex flex-col text-[10px] text-slate-400 font-mono text-center">
          {hours.map((hour) => (
            <div key={hour} className="h-14 border-b border-slate-800/60 flex items-center justify-center">
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 7 Days Columns */}
        <div className="grid grid-cols-7 flex-1 divide-x divide-slate-800/60 relative">
          {days.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');

            const dayEvents = events.filter((ev) => {
              const evDate = format(parseISO(ev.start_time), 'yyyy-MM-dd');
              return evDate === dayStr;
            });

            return (
              <div key={dayStr} className="relative h-[1344px] flex-1 bg-slate-950/20">
                {/* Hour lines */}
                {hours.map((h) => (
                  <div key={h} className="h-14 border-b border-slate-800/40" />
                ))}

                {/* Event Cards */}
                {dayEvents.map((ev) => {
                  const evStart = parseISO(ev.start_time);
                  const evEnd = parseISO(ev.end_time);
                  const startHour = evStart.getHours() + evStart.getMinutes() / 60;
                  const endHour = evEnd.getHours() + evEnd.getMinutes() / 60;
                  const duration = Math.max(0.5, endHour - startHour);

                  const topPx = startHour * 56; // 56px per hour
                  const heightPx = duration * 56;

                  const cal = calendarMap.get(ev.calendar_id);
                  const isCreator = ev.creator_id === currentUser.user_id;
                  const displayTitle = ev.is_private && !isCreator ? '🔒 바쁨 (Busy)' : ev.title;
                  const color = cal?.color_code || '#3B82F6';

                  return (
                    <div
                      key={ev.event_id}
                      onClick={() => onSelectEvent(ev)}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        backgroundColor: `${color}25`,
                        borderColor: color,
                      }}
                      className="absolute left-1 right-1 p-1.5 rounded-lg border text-xs text-white overflow-hidden shadow cursor-pointer transition-all hover:scale-[1.02] z-10"
                    >
                      <div className="font-semibold text-[11px] truncate flex items-center gap-1">
                        {ev.is_private && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                        {displayTitle}
                      </div>
                      <div className="text-[10px] opacity-80 font-mono">
                        {format(evStart, 'HH:mm')} - {format(evEnd, 'HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
