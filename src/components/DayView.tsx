'use client';

import React from 'react';
import { CalendarEvent, User, Calendar } from '@/types';
import { format, parseISO, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, MapPin, Lock, AlignLeft, User as UserIcon } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  currentUser: User | null;
  calendars: Calendar[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export function DayView({
  currentDate,
  events,
  currentUser,
  calendars,
  onSelectEvent,
}: DayViewProps) {
  const dayStr = format(currentDate, 'yyyy-MM-dd');
  const dayEvents = events
    .filter((ev) => format(parseISO(ev.start_time), 'yyyy-MM-dd') === dayStr)
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

  const calendarMap = new Map(calendars.map((c) => [c.calendar_id, c]));

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4 sm:p-6">
      {/* Date Title Banner */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {format(currentDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            등록된 일정 총 {dayEvents.length}개
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 py-16 gap-2">
            <Clock className="w-10 h-10 stroke-1 opacity-50" />
            <p className="text-sm">이날 등록된 일정이 없습니다.</p>
          </div>
        ) : (
          dayEvents.map((ev) => {
            const cal = calendarMap.get(ev.calendar_id);
            const isCreator = currentUser ? ev.creator_id === currentUser.user_id : false;
            const displayTitle = ev.is_private && !isCreator ? '🔒 바쁨 (Busy)' : ev.title;
            const color = cal?.color_code || '#3B82F6';

            return (
              <div
                key={ev.event_id}
                onClick={() => onSelectEvent(ev)}
                style={{ borderLeftColor: color }}
                className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 border-l-4 text-slate-200 transition-all cursor-pointer shadow-md flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ev.is_private && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                      {displayTitle}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono">
                    {cal?.name}
                  </span>
                </div>

                {/* Time & Location */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {ev.is_all_day
                        ? '종일 일정'
                        : `${format(parseISO(ev.start_time), 'HH:mm')} ~ ${format(parseISO(ev.end_time), 'HH:mm')}`}
                    </span>
                  </div>

                  {ev.location && (!ev.is_private || isCreator) && (
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {ev.description && (!ev.is_private || isCreator) && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    {ev.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
