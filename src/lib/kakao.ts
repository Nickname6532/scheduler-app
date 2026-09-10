declare global {
  interface Window {
    Kakao: any;
  }
}

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '';

export function initKakao(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.Kakao) return false;

  if (!window.Kakao.isInitialized()) {
    if (KAKAO_JS_KEY) {
      window.Kakao.init(KAKAO_JS_KEY);
      return window.Kakao.isInitialized();
    }
  }
  return window.Kakao.isInitialized();
}

export function shareCalendarInvite(options: {
  calendarName: string;
  inviterName: string;
  inviteCode: string;
}) {
  const isInitialized = initKakao();
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${options.inviteCode}`;

  if (isInitialized && window.Kakao?.Share) {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `📅 [모여봐] '${options.calendarName}' 캘린더 초대`,
        description: `${options.inviterName}님이 공유 캘린더에 초대했습니다. 들어와서 함께 일정을 공유하고 빈 시간을 찾아보세요!`,
        imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
        link: {
          mobileWebUrl: inviteUrl,
          webUrl: inviteUrl,
        },
      },
      buttons: [
        {
          title: '캘린더 참여하기',
          link: {
            mobileWebUrl: inviteUrl,
            webUrl: inviteUrl,
          },
        },
      ],
    });
    return true;
  } else {
    // Fallback: Copy link to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    return false;
  }
}
