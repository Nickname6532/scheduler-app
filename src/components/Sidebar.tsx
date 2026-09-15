'use client';

import React from 'react';
import { Calendar, User, CalendarMember } from '@/types';
import {
  Calendar as CalendarIcon,
  Users,
  Plus,
  Sparkles,
  Lock,
  Grid,
  List,
  ChevronRight,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface SidebarProps {
  calendars: Calendar[];
  activeCalendar: Calendar | null;
  onSelectCalendar: (calendar: Calendar) => void;
  onOpenNewCalendarModal: () => void;
  onOpenInviteModal: () => void;
  onOpenFreeBusyModal: () => void;
  viewMode: 'month' | 'week' | 'day';
  onChangeViewMode: (mode: 'month' | 'week' | 'day') => void;
  calendarMembers: (CalendarMember & { user?: User })[];
  currentUser: User | null;
}

export function Sidebar({
  calendars,
  activeCalendar,
  onSelectCalendar,
  onOpenNewCalendarModal,
  onOpenInviteModal,
  onOpenFreeBusyModal,
  viewMode,
  onChangeViewMode,
  calendarMembers,
  currentUser,
}: SidebarProps) {
  const personalCalendars = calendars.filter((c) => c.is_personal);
  const groupCalendars = calendars.filter((c) => !c.is_personal);

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 p-4 flex flex-col gap-6 shrink-0">
      {/* View Switcher */}
      <div className="bg-slate-800/80 p-1 rounded-xl flex items-center gap-1 border border-slate-700/60">
        <button
          onClick={() => onChangeViewMode('month')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'month' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          월간
        </button>
        <button
          onClick={() => onChangeViewMode('week')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'week' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          주간
        </button>
        <button
          onClick={() => onChangeViewMode('day')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'day' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          일간
        </button>
      </div>

      {/* Main Free Time Finder Banner */}
      <div
        onClick={onOpenFreeBusyModal}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-4 hover:border-amber-400/50 transition-all shadow-lg"
      >
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all" />
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <Sparkles className="w-4 h-4 fill-amber-400" />
          <span>공통 빈 시간 계산기</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          그룹 멤버들의 겹치는 일정을 제외하고 모두 가능한 빈 시간을 1초 만에 도출합니다.
        </p>
        <div className="flex items-center text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition-transform">
          <span>무료 시간 도출하기</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>

      {/* Calendars List */}
      <div className="flex flex-col gap-4">
        {/* Personal Calendar */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            개인 캘린더
          </div>
          {personalCalendars.map((cal) => (
            <button
              key={cal.calendar_id}
              onClick={() => onSelectCalendar(cal)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                activeCalendar?.calendar_id === cal.calendar_id
                  ? 'bg-slate-800 border border-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cal.color_code }} />
                <span className="truncate">{cal.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Shared Group Calendars */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              공유 그룹 캘린더
            </span>
            <button
              onClick={onOpenNewCalendarModal}
              className="text-amber-400 hover:text-amber-300 p-0.5 rounded transition-colors"
              title="그룹 캘린더 생성"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {groupCalendars.length === 0 ? (
              <div className="text-xs text-slate-400 italic px-2 py-3 bg-slate-800/30 rounded-xl border border-slate-800 text-center">
                공유 캘린더가 없습니다.
              </div>
            ) : (
              groupCalendars.map((cal) => (
                <button
                  key={cal.calendar_id}
                  onClick={() => onSelectCalendar(cal)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeCalendar?.calendar_id === cal.calendar_id
                      ? 'bg-slate-800 border border-slate-700 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cal.color_code }} />
                    <span className="truncate">{cal.name}</span>
                  </div>
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Current Group Calendar Members Panel */}
        {activeCalendar && !activeCalendar.is_personal && (
          <div className="mt-2 bg-slate-800/40 rounded-xl border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                참여 멤버 ({calendarMembers.length})
              </span>
              <button
                onClick={onOpenInviteModal}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                <UserPlus className="w-3 h-3" />
                초대
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {calendarMembers.map((m) => (
                <div key={m.member_id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={m.user?.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate text-slate-200">{m.user?.nickname || '사용자'}</span>
                  </div>
                  {m.role === 'OWNER' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-500/30">
                      방장
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
