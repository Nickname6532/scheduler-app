import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '모여봐 - 카카오톡 친구/가족 일정 공유 & 빈 시간 찾기',
  description:
    '카카오톡 기반 소규모 그룹 캘린더 서비스. 개인 일정을 공유하고 자동으로 겹침 없는 공통 빈 시간을 추천하여 약속을 손쉽게 잡아보세요.',
  keywords: ['카카오톡 캘린더', '일정 공유', '빈 시간 찾기', '모여봐', '캘린더 앱', 'PWA'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
