'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import {
  loadAppState,
  saveAppState,
  getCurrentUser,
  setCurrentUser,
  logoutUser,
  clearAllData,
  createInitialUserData,
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
  Mail,
  UserCheck,
} from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
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

  // Initialize data on mount & check login callbacks
  useEffect(() => {
    let curUser = getCurrentUser();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      // 1. Check Kakao OAuth success
      const kakaoAuth = params.get('kakao_auth');
      if (kakaoAuth === 'success') {
        const nickname = params.get('nickname') || '카카오 회원';
        const email = params.get('email') || '';
        const profile = params.get('profile') || '';
        const kakaoId = params.get('kakao_id') || `kakao_${Date.now()}`;

        curUser = {
          user_id: `u-${kakaoId}`,
          kakao_id: kakaoId,
          nickname,
          email,
          profile_image_url: profile || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentUser(curUser);
        setToastMessage(`'${nickname}'님, 카카오 계정으로 로그인되었습니다!`);
        window.history.replaceState({}, '', window.location.pathname);
      }

      // 2. Check Kakao OAuth error
      const kakaoError = params.get('kakao_error');
      if (kakaoError) {
        if (kakaoError === 'no_api_key') {
          setToastMessage('카카오 API 키(KAKAO_REST_API_KEY)가 Vercel 환경변수에 아직 설정되지 않았습니다.');
        } else {
          setToastMessage(`카카오 로그인 오류: ${kakaoError}`);
        }
        window.history.replaceState({}, '', window.location.pathname);
      }

      // 3. Check magic login link params
      const authEmail = params.get('auth_email');
      if (authEmail) {
        curUser = {
          user_id: `u-${Date.now()}`,
          kakao_id: '',
          email: authEmail,
          nickname: authEmail.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentUser(curUser);
        setToastMessage(`'${authEmail}' 로그인 링크로 접속되었습니다.`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    const data = loadAppState(curUser);
    setAppState(data);
    setCurrentUserState(curUser);

    if (data.calendars.length > 0) {
      setActiveCalendar(data.calendars[0]);
    }
  }, []);

  if (!appState) {
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

  // Logout handler
  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    const emptyState: AppStateData = { users: [], calendars: [], members: [], events: [], invitations: [] };
    setAppState(emptyState);
    setActiveCalendar(null);
    setToastMessage('로그아웃되었습니다.');
  };

  // Reset to fresh data
  const handleResetData = () => {
    clearAllData();
    if (currentUserState) {
      const fresh = createInitialUserData(currentUserState);
      saveAppState(fresh);
      setAppState(fresh);
      if (fresh.calendars.length > 0) setActiveCalendar(fresh.calendars[0]);
    } else {
      const emptyState: AppStateData = { users: [], calendars: [], members: [], events: [], invitations: [] };
      setAppState(emptyState);
      setActiveCalendar(null);
    }
    setToastMessage('캘린더 데이터가 초기화되었습니다.');
  };

  // Start with clean guest account
  const handleGuestStart = () => {
    const guestUser: User = {
      user_id: `u-guest-${Date.now()}`,
      kakao_id: '',
      nickname: '게스트',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCurrentUser(guestUser);
    setCurrentUserState(guestUser);
    const fresh = createInitialUserData(guestUser);
    saveAppState(fresh);
    setAppState(fresh);
    setActiveCalendar(fresh.calendars[0]);
    setToastMessage('게스트 모드로 시작되었습니다.');
  };

  // Save Event
  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (!currentUserState) {
      setIsEmailAuthOpen(true);
      return;
    }

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
      const targetCalId = eventData.calendar_id || activeCalendar?.calendar_id || appState.calendars[0]?.calendar_id;
      if (!targetCalId) {
        setToastMessage('캘린더를 먼저 선택해주세요.');
        return;
      }

      const newEv: CalendarEvent = {
        event_id: `ev-${Date.now()}`,
        calendar_id: targetCalId,
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
    if (!currentUserState) {
      setIsEmailAuthOpen(true);
      return;
    }

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
    if (!currentUserState) {
      setIsEmailAuthOpen(true);
      return;
    }

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
        activeCalendar={activeCalendar}
        calendars={appState.calendars}
        onSelectCalendar={(cal) => setActiveCalendar(cal)}
        onOpenNewEventModal={() => {
          if (!currentUserState) {
            setIsEmailAuthOpen(true);
            return;
          }
          setSelectedEvent(null);
          setIsEventModalOpen(true);
        }}
        onOpenNewCalendarModal={() => {
          if (!currentUserState) {
            setIsEmailAuthOpen(true);
            return;
          }
          setIsCalendarModalOpen(true);
        }}
        onOpenFreeBusyModal={() => setIsFreeBusyOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenAuthModal={() => setIsEmailAuthOpen(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row p-3 sm:p-5 gap-4 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          calendars={appState.calendars}
          activeCalendar={activeCalendar}
          onSelectCalendar={(cal) => setActiveCalendar(cal)}
          onOpenNewCalendarModal={() => {
            if (!currentUserState) {
              setIsEmailAuthOpen(true);
              return;
            }
            setIsCalendarModalOpen(true);
          }}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onOpenFreeBusyModal={() => setIsFreeBusyOpen(true)}
          viewMode={viewMode}
          onChangeViewMode={(m) => setViewMode(m)}
          calendarMembers={activeMembers}
          currentUser={currentUserState}
        />

        {/* Calendar View Panel */}
        <main className="flex-1 flex flex-col gap-3 min-w-0 h-[calc(100vh-130px)]">
          {/* Welcome / Real Version CTA Banner (when not logged in) */}
          {!currentUserState && (
            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in">
              <div className="flex flex-col gap-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-bold text-base">
                  <Sparkles className="w-5 h-5 fill-amber-400" />
                  <span>나만의 실사용 캘린더 시작하기</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  카카오 또는 이메일로 간편 로그인하여 친구·가족과 실시간으로 일정을 공유하고 빈 시간을 맞춰보세요.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/api/auth/kakao/login"
                  className="px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>카카오 로그인</span>
                </a>
                <button
                  onClick={() => setIsEmailAuthOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>이메일 로그인</span>
                </button>
                <button
                  onClick={handleGuestStart}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
                >
                  게스트 모드
                </button>
              </div>
            </div>
          )}

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
                  if (!currentUserState) {
                    setIsEmailAuthOpen(true);
                    return;
                  }
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
        currentUser={currentUserState || {
          user_id: 'guest',
          kakao_id: '',
          nickname: '게스트',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }}
        onConfirmSlotAsEvent={handleConfirmSlotAsEvent}
      />

      {currentUserState && (
        <>
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
        </>
      )}

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
          const loggedUser: User = {
            user_id: `u-${Date.now()}`,
            kakao_id: '',
            email: verifiedEmail,
            nickname: verifiedEmail.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCurrentUser(loggedUser);
          setCurrentUserState(loggedUser);
          const freshData = loadAppState(loggedUser);
          setAppState(freshData);
          saveAppState(freshData);
          if (freshData.calendars.length > 0) {
            setActiveCalendar(freshData.calendars[0]);
          }
          setToastMessage(`'${loggedUser.nickname}'님, 로그인되었습니다!`);
        }}
      />

      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
