'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { loadAppState, saveAppState, getCurrentUser } from '@/lib/storage';
import { Calendar, User } from '@/types';
import { Calendar as CalendarIcon, CheckCircle2, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InviteJoinPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const inviteCode = resolvedParams.code;

  const [joined, setJoined] = useState(false);
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [inviter, setInviter] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const state = loadAppState();
    const curUser = getCurrentUser();
    setCurrentUser(curUser);

    // Find invitation or target calendar from code
    // Format: invite-{calendar_id}-{inviter_id_suffix}
    const cal = state.calendars.find((c) => inviteCode.includes(c.calendar_id)) || state.calendars[1] || state.calendars[0];
    setCalendar(cal);

    if (cal) {
      const inv = state.users.find((u) => u.user_id === cal.owner_id);
      setInviter(inv || state.users[0]);
    }
  }, [inviteCode]);

  const handleJoin = () => {
    if (!calendar || !currentUser) return;

    const state = loadAppState();
    const existing = state.members.find(
      (m) => m.calendar_id === calendar.calendar_id && m.user_id === currentUser.user_id
    );

    if (!existing) {
      state.members.push({
        member_id: `m-${Date.now()}`,
        calendar_id: calendar.calendar_id,
        user_id: currentUser.user_id,
        role: 'MEMBER',
        joined_at: new Date().toISOString(),
      });
      saveAppState(state);
    }

    setJoined(true);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
          <MessageCircle className="w-9 h-9 fill-amber-400" />
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            카카오톡 캘린더 초대장
          </div>
          <h1 className="text-2xl font-bold text-white">
            {inviter?.nickname || '친구'}님이 캘린더에 초대하셨습니다!
          </h1>
        </div>

        {calendar && (
          <div className="w-full bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-base font-bold text-amber-300">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: calendar.color_code }} />
              {calendar.name}
            </div>
            {calendar.description && (
              <div className="text-xs text-slate-400">{calendar.description}</div>
            )}
          </div>
        )}

        <div className="text-xs text-slate-300 leading-relaxed">
          초대를 수락하면 카카오 계정({currentUser?.nickname})으로 해당 캘린더의 일정 및 빈 시간 조율에 참여할 수 있습니다.
        </div>

        {joined ? (
          <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>참여 완료! 메인 화면으로 이동합니다...</span>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>초대 수락하고 캘린더 조인하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </main>
  );
}
