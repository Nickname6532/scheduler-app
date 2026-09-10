'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, User, CalendarMember, CalendarEvent, FreeSlot } from '@/types';
import { calculateFreeSlots } from '@/lib/freeBusyEngine';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Sparkles,
  X,
  Calendar as CalendarIcon,
  Users,
  Clock,
  CheckCircle2,
  Filter,
  PlusCircle,
  Zap,
} from 'lucide-react';

interface FreeBusyModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendars: Calendar[];
  allMembers: (CalendarMember & { user?: User })[];
  allEvents: CalendarEvent[];
  allUsers: User[];
  currentUser: User;
  onConfirmSlotAsEvent: (slot: FreeSlot, calendarId: string) => void;
}

export function FreeBusyModal({
  isOpen,
  onClose,
  calendars,
  allMembers,
  allEvents,
  allUsers,
  currentUser,
  onConfirmSlotAsEvent,
}: FreeBusyModalProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekLaterStr = format(addDays(new Date(), 6), 'yyyy-MM-dd');

  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(
    calendars.find((c) => !c.is_personal)?.calendar_id || calendars[0]?.calendar_id || ''
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(allUsers.map((u) => u.user_id));
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(weekLaterStr);
  const [activeStartHour, setActiveStartHour] = useState<number>(9);
  const [activeEndHour, setActiveEndHour] = useState<number>(22);
  const [minDurationMinutes, setMinDurationMinutes] = useState<number>(60);

  // Available users in selected calendar or overall
  const availableUsers = useMemo(() => {
    if (!selectedCalendarId) return allUsers;
    const targetMembers = allMembers.filter((m) => m.calendar_id === selectedCalendarId);
    if (targetMembers.length === 0) return allUsers;
    const uIds = new Set(targetMembers.map((m) => m.user_id));
    return allUsers.filter((u) => uIds.has(u.user_id));
  }, [selectedCalendarId, allMembers, allUsers]);

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      if (selectedUserIds.length > 1) {
        setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
      }
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  // Run free slot calculation
  const freeSlots = useMemo(() => {
    if (!isOpen) return [];
    const participants = availableUsers.filter((u) => selectedUserIds.includes(u.user_id));
    return calculateFreeSlots(
      allEvents,
      {
        calendarId: selectedCalendarId,
        memberUserIds: selectedUserIds,
        startDate,
        endDate,
        activeStartHour,
        activeEndHour,
        minDurationMinutes,
      },
      participants
    );
  }, [
    isOpen,
    allEvents,
    selectedCalendarId,
    selectedUserIds,
    startDate,
    endDate,
    activeStartHour,
    activeEndHour,
    minDurationMinutes,
    availableUsers,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 font-bold">
              <Sparkles className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                모두가 가능한 빈 시간 도출 엔진
              </h2>
              <p className="text-xs text-slate-400">
                선택한 멤버들의 일정을 분석하여 겹침 없는 공통 가용 시간대를 찾아냅니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            {/* Calendar Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                대상 캘린더
              </label>
              <select
                value={selectedCalendarId}
                onChange={(e) => setSelectedCalendarId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {calendars.map((c) => (
                  <option key={c.calendar_id} value={c.calendar_id}>
                    {c.name} {c.is_personal ? '(개인)' : '(그룹)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                최소 필요한 약속 시간
              </label>
              <div className="flex items-center gap-1">
                {[30, 60, 120, 180].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setMinDurationMinutes(dur)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      minDurationMinutes === dur
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {dur < 60 ? `${dur}분` : `${dur / 60}시간`}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                조회 기간 설정
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <span className="text-slate-400 text-xs">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(todayStr);
                      setEndDate(format(addDays(new Date(), 2), 'yyyy-MM-dd'));
                    }}
                    className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700"
                  >
                    3일간
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(todayStr);
                      setEndDate(weekLaterStr);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700"
                  >
                    일주일
                  </button>
                </div>
              </div>
            </div>

            {/* Active Hours Slider */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>활동 가능 시간대 범위</span>
                <span className="text-amber-400 font-mono">
                  {String(activeStartHour).padStart(2, '0')}:00 ~ {String(activeEndHour).padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="6"
                  max="12"
                  value={activeStartHour}
                  onChange={(e) => setActiveStartHour(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <input
                  type="range"
                  min="13"
                  max="24"
                  value={activeEndHour}
                  onChange={(e) => setActiveEndHour(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Participant Checkboxes */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                시간 맞출 대상 멤버 선택 ({selectedUserIds.length}명 선택됨)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.user_id);
                  return (
                    <button
                      key={u.user_id}
                      type="button"
                      onClick={() => toggleUserSelection(u.user_id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <img
                        src={u.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{u.nickname}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Output Results */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                도출된 공통 빈 시간 ({freeSlots.length}개 발견)
              </h3>
            </div>

            {freeSlots.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 text-xs">
                설정한 기간 및 활동 시간 내에 조건에 맞는 공통 빈 시간이 없습니다.
                <br />
                활동 시간대 범위를 넓히거나 필요한 약속 시간을 줄여보세요!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {freeSlots.map((slot, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:border-amber-400/50 transition-all flex flex-col gap-2.5 shadow-md group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {slot.recommendationTag}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {slot.durationMinutes >= 60
                          ? `${Math.floor(slot.durationMinutes / 60)}시간 ${slot.durationMinutes % 60}분`
                          : `${slot.durationMinutes}분`}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white">
                        {format(new Date(slot.start_time), 'M월 d일 (EEEE)', { locale: ko })}
                      </div>
                      <div className="text-xs font-mono text-amber-300 font-medium">
                        {slot.startTimeStr} ~ {slot.endTimeStr}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {slot.participants.map((p) => (
                          <img
                            key={p.user_id}
                            src={p.profile_image_url}
                            alt={p.nickname}
                            title={p.nickname}
                            className="w-5 h-5 rounded-full border border-slate-900 object-cover"
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          onConfirmSlotAsEvent(slot, selectedCalendarId);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>약속 등록</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
