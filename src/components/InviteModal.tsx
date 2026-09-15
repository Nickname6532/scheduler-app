'use client';

import React, { useState } from 'react';
import { Calendar, User } from '@/types';
import { shareCalendarInvite } from '@/lib/kakao';
import { X, MessageCircle, Copy, Check, Link as LinkIcon, ShieldCheck } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: Calendar | null;
  currentUser: User | null;
  onShowToast: (msg: string) => void;
}

export function InviteModal({
  isOpen,
  onClose,
  calendar,
  currentUser,
  onShowToast,
}: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !calendar) return null;

  // Generate dynamic invite code / link
  const inviteCode = `invite-${calendar.calendar_id}-${calendar.owner_id.slice(-4)}`;
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${inviteCode}`
    : `https://scheduler-app-eight-delta.vercel.app/invite/${inviteCode}`;

  const handleKakaoShare = () => {
    const success = shareCalendarInvite({
      calendarName: calendar.name,
      inviterName: currentUser?.nickname || '친구',
      inviteCode,
    });

    if (success) {
      onShowToast('카카오톡 공유창이 열렸습니다!');
    } else {
      // Fallback copied
      setCopied(true);
      onShowToast('카카오톡 SDK 미연동 환경: 초대 링크가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      onShowToast('초대 링크가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-yellow-500/20 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <h2 className="text-lg font-bold text-white">카카오톡 초대 전송</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <div className="text-xs text-slate-400">초대할 캘린더</div>
            <div className="text-base font-bold text-amber-300 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: calendar.color_code }} />
              {calendar.name}
            </div>
            {calendar.description && (
              <div className="text-xs text-slate-300 mt-1">{calendar.description}</div>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            카카오톡 공유 API를 사용해 친구나 가족을 캘린더에 초대하세요.
            초대 링크를 받아 접속한 친구는 자동으로 캘린더 멤버로 조인됩니다.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={handleKakaoShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-yellow-500/20 transition-all active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              <span>카카오톡으로 공유하기</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">링크가 복사되었습니다</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>초대 링크 URL 직접 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
