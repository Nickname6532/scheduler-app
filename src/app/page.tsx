'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import {
  loadAppState,
  saveAppState,
  getCurrentUser,
  setCurrentUser,
  getInitialSeedData,
  AppStateData,
} from '@/lib/storage';
import { Calendar, CalendarEvent, User, CalendarMember, FreeSlot } from '@/types';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MonthView } from '@/components/MonthView';
import { WeekView } from '@/components/WeekView';
import { DayView } from '@/components/DayView';
import { FreeBusyModal } from '@/components/FreeBusyModal';
import { EventModal } from '@/components/EventModal';
import { CalendarModal } from '@/components/CalendarModal';
import { InviteModal } from '@/components/InviteModal';
import { EmailAuthModal } from '@/components/EmailAuthModal';
import { Toast } from '@/components/Toast';

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  MessageCircle,
  Users,
} from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function HomePage() {
  const [appState, setAppState] = useState<AppStateData | null>(null);
  const [currentUserState, setCurrentUserState] = useState<User | null>(null);
  const [activeCalendar, setActiveCalendar] = useState<Calendar | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Modals state
  const [isFreeBusyOpen, setIsFreeBusyOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEmailAuthOpen, setIsEmailAuthOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const data = loadAppState();
    const curUser = getCurrentUser();
    setAppState(data);
    setCurrentUserState(curUser);

    if (data.calendars.length > 0) {
      setActiveCalendar(data.calendars[0]);
    }
  }, []);

  if (!appState || !currentUserState) {
    return (
      <div className="min-h-screen bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-lg">
        모여봐 로딩 중...
      </div>
    );
  }

  // Active Calendar Members
  const activeMembers = activeCalendar
    ? appState.members
        .filter((m) => m.calendar_id === activeCalendar.calendar_id)
        .map((m) => ({
          ...m,
          user: appState.users.find((u) => u.user_id === m.user_id),
        }))
    : [];

  // Filter events by active calendar
  const activeEvents = activeCalendar
    ? appState.events.filter((ev) => ev.calendar_id === activeCalendar.calendar_id)
    : appState.events;

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Switch demo user
  const handleSwitchUser = (user: User) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    setToastMessage(`로그인 계정이 '${user.nickname}'(으)로 전환되었습니다.`);
  };

  // Reset to seed data
  const handleResetData = () => {
    const seed = getInitialSeedData();
    setAppState(seed);
    saveAppState(seed);
    if (seed.calendars.length > 0) {
      setActiveCalendar(seed.calendars[0]);
    }
    setToastMessage('데모 데이터가 초기화되었습니다.');
  };

  // Save Event
  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    const updatedEvents = [...appState.events];

    if (eventData.event_id) {
      // Edit existing
      const idx = updatedEvents.findIndex((e) => e.event_id === eventData.event_id);
      if (idx !== -1) {
        updatedEvents[idx] = {
          ...updatedEvents[idx],
          ...eventData,
          updated_at: new Date().toISOString(),
        } as CalendarEvent;
      }
    } else {
      // Create new
      const newEv: CalendarEvent = {
        event_id: `ev-${Date.now()}`,
        calendar_id: eventData.calendar_id || activeCalendar?.calendar_id || appState.calendars[0].calendar_id,
        creator_id: currentUserState.user_id,
        title: eventData.title || '새 일정',
        description: eventData.description,
        start_time: eventData.start_time || new Date().toISOString(),
        end_time: eventData.end_time || new Date().toISOString(),
        is_all_day: eventData.is_all_day || false,
        is_private: eventData.is_private || false,
        location: eventData.location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updatedEvents.push(newEv);
    }

    const newState = { ...appState, events: updatedEvents };
    setAppState(newState);
    saveAppState(newState);
    setToastMessage('일정이 성공적으로 저장되었습니다.');
  };

  // Delete Event
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = appState.events.filter((e) => e.event_id !== eventId);
    const newState = { ...appState, events: updatedEvents };
    setAppState(newState);
    saveAppState(newState);
    setToastMessage('일정이 삭제되었습니다.');
  };

  // Create Group Calendar
  const handleCreateCalendar = (calData: { name: string; description?: string; color_code: string }) => {
    const newCal: Calendar = {
      calendar_id: `cal-${Date.now()}`,
      owner_id: currentUserState.user_id,
      name: calData.name,
      description: calData.description,
      color_code: calData.color_code,
      is_personal: false,
      created_at: new Date().toISOString(),
    };

    const newMember: CalendarMember = {
      member_id: `m-${Date.now()}`,
      calendar_id: newCal.calendar_id,
      user_id: currentUserState.user_id,
      role: 'OWNER',
      joined_at: new Date().toISOString(),
    };

    const newState: AppStateData = {
      ...appState,
      calendars: [...appState.calendars, newCal],
      members: [...appState.members, newMember],
    };

    setAppState(newState);
    saveAppState(newState);
    setActiveCalendar(newCal);
    setToastMessage(`'${newCal.name}' 공유 캘린더가 생성되었습니다.`);
  };

  // Confirm Slot from Free-Busy Finder
  const handleConfirmSlotAsEvent = (slot: FreeSlot, targetCalendarId: string) => {
    setSelectedEvent({
      calendar_id: targetCalendarId,
      title: '🤝 약속 모임',
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_all_day: false,
      is_private: false,
    });
    setIsEventModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Kakao SDK Script Load */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiGlNWd3fOf27i5eLgM85tDk1S0bXk/8R07i7rT7u5N2D0bXn0J2N3h/8k8h3K1/"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />

      {/* Header */}
      <Header
        currentUser={currentUserState}
        onSwitchUser={handleSwitchUser}
        activeCalendar={activeCalendar}
        calendars={appState.calendars}
        onSelectCalendar={(cal) => setActiveCalendar(cal)}
        onOpenNewEventModal={() => {
          setSelectedEvent(null);
          setIsEventModalOpen(true);
        }}
        onOpenNewCalendarModal={() => setIsCalendarModalOpen(true)}
        onOpenFreeBusyModal={() => setIsFreeBusyOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenEmailAuthModal={() => setIsEmailAuthOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row p-3 sm:p-5 gap-4 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          calendars={appState.calendars}
          activeCalendar={activeCalendar}
          onSelectCalendar={(cal) => setActiveCalendar(cal)}
          onOpenNewCalendarModal={() => setIsCalendarModalOpen(true)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onOpenFreeBusyModal={() => setIsFreeBusyOpen(true)}
          viewMode={viewMode}
          onChangeViewMode={(m) => setViewMode(m)}
          calendarMembers={activeMembers}
          currentUser={currentUserState}
        />

        {/* Calendar View Panel */}
        <main className="flex-1 flex flex-col gap-3 min-w-0 h-[calc(100vh-130px)]">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 px-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-colors"
              >
                오늘
              </button>
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
                <button
                  onClick={handlePrev}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white ml-2">
                {viewMode === 'month' && format(currentDate, 'yyyy년 M월', { locale: ko })}
                {viewMode === 'week' && format(currentDate, 'yyyy년 M월', { locale: ko })}
                {viewMode === 'day' && format(currentDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
              </h2>
            </div>

            {/* Quick Free Busy Button on Header */}
            <button
              onClick={() => setIsFreeBusyOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>빈 시간 빠른 찾기</span>
            </button>
          </div>

          {/* Active View Renderer */}
          <div className="flex-1 min-h-0">
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={activeEvents}
                currentUser={currentUserState}
                activeCalendar={activeCalendar}
                calendars={appState.calendars}
                onSelectEvent={(ev) => {
                  setSelectedEvent(ev);
                  setIsEventModalOpen(true);
                }}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setSelectedEvent({
                    start_time: d.toISOString(),
                    end_time: d.toISOString(),
                  });
                  setIsEventModalOpen(true);
                }}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={activeEvents}
                currentUser={currentUserState}
                calendars={appState.calendars}
                onSelectEvent={(ev) => {
                  setSelectedEvent(ev);
                  setIsEventModalOpen(true);
                }}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
              />
            )}

            {viewMode === 'day' && (
              <DayView
                currentDate={currentDate}
                events={activeEvents}
                currentUser={currentUserState}
                calendars={appState.calendars}
                onSelectEvent={(ev) => {
                  setSelectedEvent(ev);
                  setIsEventModalOpen(true);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <FreeBusyModal
        isOpen={isFreeBusyOpen}
        onClose={() => setIsFreeBusyOpen(false)}
        calendars={appState.calendars}
        allMembers={appState.members.map((m) => ({
          ...m,
          user: appState.users.find((u) => u.user_id === m.user_id),
        }))}
        allEvents={appState.events}
        allUsers={appState.users}
        currentUser={currentUserState}
        onConfirmSlotAsEvent={handleConfirmSlotAsEvent}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        initialEvent={selectedEvent}
        calendars={appState.calendars}
        currentUser={currentUserState}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        currentUser={currentUserState}
        onCreateCalendar={handleCreateCalendar}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        calendar={activeCalendar}
        currentUser={currentUserState}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      <EmailAuthModal
        isOpen={isEmailAuthOpen}
        onClose={() => setIsEmailAuthOpen(false)}
        onSuccess={(verifiedEmail) => {
          setToastMessage(`'${verifiedEmail}' 이메일 인증이 완료되었습니다!`);
        }}
      />

      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
