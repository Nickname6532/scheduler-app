'use client';

import React, { useState, useEffect } from 'react';
import { CalendarEvent, Calendar, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { X, Lock, MapPin, AlignLeft, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: Partial<CalendarEvent> | null;
  calendars: Calendar[];
  currentUser: User;
  onSaveEvent: (eventData: Partial<CalendarEvent>) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export function EventModal({
  isOpen,
  onClose,
  initialEvent,
  calendars,
  currentUser,
  onSaveEvent,
  onDeleteEvent,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('11:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setCalendarId(initialEvent.calendar_id || calendars[0]?.calendar_id || '');
      setIsAllDay(initialEvent.is_all_day || false);
      setIsPrivate(initialEvent.is_private || false);
      setLocation(initialEvent.location || '');
      setDescription(initialEvent.description || '');

      if (initialEvent.start_time) {
        const d = parseISO(initialEvent.start_time);
        setStartDate(format(d, 'yyyy-MM-dd'));
        setStartTime(format(d, 'HH:mm'));
      } else {
        const today = new Date();
        setStartDate(format(today, 'yyyy-MM-dd'));
      }

      if (initialEvent.end_time) {
        const d = parseISO(initialEvent.end_time);
        setEndDate(format(d, 'yyyy-MM-dd'));
        setEndTime(format(d, 'HH:mm'));
      } else {
        const today = new Date();
        setEndDate(format(today, 'yyyy-MM-dd'));
      }
    } else {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      setTitle('');
      setCalendarId(calendars[0]?.calendar_id || '');
      setStartDate(todayStr);
      setStartTime('14:00');
      setEndDate(todayStr);
      setEndTime('15:00');
      setIsAllDay(false);
      setIsPrivate(false);
      setLocation('');
      setDescription('');
    }
  }, [initialEvent, calendars, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !calendarId) return;

    const startISO = `${startDate}T${isAllDay ? '00:00:00' : startTime + ':00'}`;
    const endISO = `${endDate}T${isAllDay ? '23:59:59' : endTime + ':00'}`;

    onSaveEvent({
      ...(initialEvent?.event_id ? { event_id: initialEvent.event_id } : {}),
      calendar_id: calendarId,
      creator_id: initialEvent?.creator_id || currentUser.user_id,
      title: title.trim(),
      description: description.trim() || undefined,
      start_time: new Date(startISO).toISOString(),
      end_time: new Date(endISO).toISOString(),
      is_all_day: isAllDay,
      is_private: isPrivate,
      location: location.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            {initialEvent?.event_id ? '일정 수정' : '새 일정 등록'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <input
              type="text"
              required
              placeholder="일정 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-semibold"
            />
          </div>

          {/* Target Calendar Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">등록할 캘린더</label>
            <select
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {calendars.map((c) => (
                <option key={c.calendar_id} value={c.calendar_id}>
                  {c.name} {c.is_personal ? '(개인)' : '(그룹)'}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Selectors */}
          <div className="flex flex-col gap-2 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                시간 설정
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>종일</span>
              </label>
            </div>

            {/* Start Date / Time */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              {!isAllDay && (
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              )}
            </div>

            {/* End Date / Time */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              {!isAllDay && (
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Private Toggle (EVENT-02) */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-amber-300">비공개 일정 (Private)</div>
                <div className="text-[11px] text-slate-400">
                  타인에게 상세 내용(제목/장소)은 숨기고 '바쁨'으로만 표시합니다.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="장소 추가 (선택)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="flex items-start gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <AlignLeft className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
            <textarea
              placeholder="설명 또는 메모 추가 (선택)"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-2">
            {initialEvent?.event_id && onDeleteEvent ? (
              <button
                type="button"
                onClick={() => {
                  if (initialEvent.event_id) onDeleteEvent(initialEvent.event_id);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
