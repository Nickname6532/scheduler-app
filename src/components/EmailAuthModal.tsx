'use client';

import React, { useState } from 'react';
import { Mail, KeyRound, CheckCircle2, AlertCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function EmailAuthModal({ isOpen, onClose, onSuccess }: EmailAuthModalProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  if (!isOpen) return null;

  // Send Code handler
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setDemoCodeHint(null);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '이메일 전송에 실패했습니다.');
      }

      setStep('code');
      if (data.isDemo && data.demoCode) {
        setDemoCodeHint(data.demoCode);
      }
    } catch (err: any) {
      console.error('Email send error:', err);
      setErrorMsg(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Code handler
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setErrorMsg('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '인증에 실패했습니다.');
      }

      onSuccess(email);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <Mail className="w-5 h-5" />
            <span>이메일 인증 코드 전송</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">인증번호 받을 이메일</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>인증 코드 전송하기</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div className="text-xs text-slate-400">
                <span className="text-indigo-300 font-semibold">{email}</span> 주소로 전송된 6자리 인증 코드를 입력하세요.
              </div>

              {demoCodeHint && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex flex-col gap-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    [환경변수 미설정 데모 모드]
                  </div>
                  <div>생성된 테스트 인증 코드: <span className="font-mono text-sm font-bold text-white tracking-widest">{demoCodeHint}</span></div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">6자리 인증 코드</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-base font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  이메일 재입력
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>인증 확인</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
