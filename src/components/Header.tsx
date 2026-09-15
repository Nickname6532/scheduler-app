'use client';

import React, { useState } from 'react';
import { User, Calendar } from '@/types';
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  MessageCircle,
  ChevronDown,
  RefreshCw,
  LogOut,
  LogIn,
  Mail,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeCalendar: Calendar | null;
  calendars: Calendar[];
  onSelectCalendar: (calendar: Calendar) => void;
  onOpenNewEventModal: () => void;
  onOpenNewCalendarModal: () => void;
  onOpenFreeBusyModal: () => void;
  onOpenInviteModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export function Header({
  currentUser,
  activeCalendar,
  calendars,
  onSelectCalendar,
  onOpenNewEventModal,
  onOpenNewCalendarModal,
  onOpenFreeBusyModal,
  onOpenInviteModal,
  onOpenAuthModal,
  onLogout,
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
          {currentUser && (
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
          {currentUser ? (
            <button
              onClick={onOpenNewEventModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">일정 등록</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>로그인</span>
            </button>
          )}

          {/* User Profile Avatar / Logout */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                {currentUser.profile_image_url ? (
                  <img
                    src={currentUser.profile_image_url}
                    alt={currentUser.nickname}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser.nickname.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-xs text-slate-300 font-medium max-w-[90px] truncate pr-1">
                  {currentUser.nickname}
                </span>
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-700/60">
                    <div className="text-xs text-slate-400">내 계정</div>
                    <div className="font-semibold text-amber-300 text-sm">{currentUser.nickname}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email || (currentUser.kakao_id ? '카카오 연동 계정' : '')}</div>
                  </div>

                  <div className="p-1.5 flex flex-col gap-1">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-700/60 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>로그아웃</span>
                    </button>

                    <button
                      onClick={onResetData}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>내 캘린더 데이터 초기화</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
