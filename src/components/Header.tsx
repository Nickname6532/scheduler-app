'use client';

import React, { useState } from 'react';
import { User, Calendar } from '@/types';
import { DEMO_USERS } from '@/lib/storage';
import { Calendar as CalendarIcon, User as UserIcon, Plus, Users, Sparkles, MessageCircle, Copy, Check, ChevronDown, RefreshCw, Mail } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  activeCalendar: Calendar | null;
  calendars: Calendar[];
  onSelectCalendar: (calendar: Calendar) => void;
  onOpenNewEventModal: () => void;
  onOpenNewCalendarModal: () => void;
  onOpenFreeBusyModal: () => void;
  onOpenInviteModal: () => void;
  onOpenEmailAuthModal: () => void;
  onResetData: () => void;
}

export function Header({
  currentUser,
  onSwitchUser,
  activeCalendar,
  calendars,
  onSelectCalendar,
  onOpenNewEventModal,
  onOpenNewCalendarModal,
  onOpenFreeBusyModal,
  onOpenInviteModal,
  onOpenEmailAuthModal,
  onResetData,
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCalDropdown, setShowCalDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Active Calendar Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-amber-400 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="hidden sm:inline">모여봐</span>
          </div>

          {/* Calendar Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowCalDropdown(!showCalDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-sm font-medium transition-all"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeCalendar?.color_code || '#3B82F6' }}
              />
              <span className="max-w-[140px] sm:max-w-[200px] truncate">
                {activeCalendar ? activeCalendar.name : '캘린더 선택'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showCalDropdown && (
              <div
                className="absolute left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowCalDropdown(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  내 캘린더 목록
                </div>
                {calendars.map((cal) => (
                  <button
                    key={cal.calendar_id}
                    onClick={() => onSelectCalendar(cal)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-700/60 transition-colors ${
                      activeCalendar?.calendar_id === cal.calendar_id ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cal.color_code }} />
                      <span className="truncate">{cal.name}</span>
                    </div>
                    {cal.is_personal && (
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 shrink-0">개인</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-700 mt-1 pt-1 px-2">
                  <button
                    onClick={onOpenNewCalendarModal}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-amber-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    새 그룹 캘린더 만들기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Email Code Verification Button */}
          <button
            onClick={onOpenEmailAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 shadow transition-all"
          >
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">이메일 인증</span>
          </button>

          {/* Free Busy Matcher Engine Button */}
          <button
            onClick={onOpenFreeBusyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>빈 시간 찾기</span>
          </button>

          {/* Kakao Share / Invite button */}
          {activeCalendar && !activeCalendar.is_personal && (
            <button
              onClick={onOpenInviteModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-medium text-xs sm:text-sm shadow transition-all"
              title="카카오톡으로 초대하기"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>카카오톡 초대</span>
            </button>
          )}

          {/* New Event Button */}
          <button
            onClick={onOpenNewEventModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">일정 등록</span>
          </button>

          {/* User & Demo Switcher Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <img
                src={currentUser.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                alt={currentUser.nickname}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
              />
              <span className="hidden md:inline text-xs text-slate-300 font-medium max-w-[90px] truncate pr-1">
                {currentUser.nickname}
              </span>
            </button>

            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-700/60">
                  <div className="text-xs text-slate-400">현재 로그인 계정</div>
                  <div className="font-semibold text-amber-300 text-sm">{currentUser.nickname}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email || '카카오 연동 계정'}</div>
                </div>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  💡 체험용 계정 전환 (권한/비공개 테스트)
                </div>
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => onSwitchUser(user)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-700/60 transition-colors ${
                      currentUser.user_id === user.user_id ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <img src={user.profile_image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="truncate">{user.nickname}</span>
                  </button>
                ))}

                <div className="border-t border-slate-700 mt-2 pt-2 px-2">
                  <button
                    onClick={onResetData}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    샘플 데모 데이터 초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
