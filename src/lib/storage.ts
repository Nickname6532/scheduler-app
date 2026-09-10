import { User, Calendar, CalendarMember, CalendarEvent, Invitation } from '@/types';
import { format, addDays, subDays, setHours } from 'date-fns';

const STORAGE_KEY = 'moyeobwa_calendar_data_v1';
const CURRENT_USER_KEY = 'moyeobwa_current_user_v1';

export const DEMO_USERS: User[] = [
  {
    user_id: 'u-1',
    kakao_id: 'kakao_1001',
    email: 'me@kakao.com',
    nickname: '김카카오 (나)',
    profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'u-2',
    kakao_id: 'kakao_1002',
    email: 'minsu@kakao.com',
    nickname: '이민수 (친구)',
    profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'u-3',
    kakao_id: 'kakao_1003',
    email: 'jieun@kakao.com',
    nickname: '박지은 (동생)',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'u-4',
    kakao_id: 'kakao_1004',
    email: 'donghoon@kakao.com',
    nickname: '최동훈 (스터디)',
    profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface AppStateData {
  users: User[];
  calendars: Calendar[];
  members: CalendarMember[];
  events: CalendarEvent[];
  invitations: Invitation[];
}

export function getInitialSeedData(): AppStateData {
  const today = new Date();
  const formatTime = (d: Date, hour: number, minute: number = 0) => {
    const target = setHours(d, hour);
    target.setMinutes(minute);
    target.setSeconds(0);
    return target.toISOString();
  };

  const calendars: Calendar[] = [
    {
      calendar_id: 'cal-personal',
      owner_id: 'u-1',
      name: '개인 캘린더',
      description: '나의 개인 일정',
      color_code: '#3B82F6', // Blue
      is_personal: true,
      created_at: new Date().toISOString(),
    },
    {
      calendar_id: 'cal-family',
      owner_id: 'u-1',
      name: '우리 가족 캘린더 🏡',
      description: '가족 외식 및 생일 모임',
      color_code: '#10B981', // Emerald
      is_personal: false,
      created_at: new Date().toISOString(),
    },
    {
      calendar_id: 'cal-friends',
      owner_id: 'u-2',
      name: '주말 모임 & 러닝 클럽 🏃‍♂️',
      description: '친구들과 시간 맞춰 운동 및 번개',
      color_code: '#8B5CF6', // Purple
      is_personal: false,
      created_at: new Date().toISOString(),
    },
  ];

  const members: CalendarMember[] = [
    // Personal
    { member_id: 'm-1', calendar_id: 'cal-personal', user_id: 'u-1', role: 'OWNER', joined_at: new Date().toISOString() },
    
    // Family
    { member_id: 'm-2', calendar_id: 'cal-family', user_id: 'u-1', role: 'OWNER', joined_at: new Date().toISOString() },
    { member_id: 'm-3', calendar_id: 'cal-family', user_id: 'u-3', role: 'MEMBER', joined_at: new Date().toISOString() },

    // Friends
    { member_id: 'm-4', calendar_id: 'cal-friends', user_id: 'u-2', role: 'OWNER', joined_at: new Date().toISOString() },
    { member_id: 'm-5', calendar_id: 'cal-friends', user_id: 'u-1', role: 'MEMBER', joined_at: new Date().toISOString() },
    { member_id: 'm-6', calendar_id: 'cal-friends', user_id: 'u-4', role: 'MEMBER', joined_at: new Date().toISOString() },
  ];

  const events: CalendarEvent[] = [
    // Today Events
    {
      event_id: 'ev-1',
      calendar_id: 'cal-personal',
      creator_id: 'u-1',
      title: '팀 스프린트 기획 회의',
      description: 'Next.js 배포 및 카카오 API 연결 점검',
      start_time: formatTime(today, 10, 0),
      end_time: formatTime(today, 11, 30),
      is_all_day: false,
      is_private: false,
      location: '강남역 루프탑 카페',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      event_id: 'ev-2',
      calendar_id: 'cal-personal',
      creator_id: 'u-1',
      title: '개인 병원 진료 🏥',
      description: '치과 정기 검진',
      start_time: formatTime(today, 15, 0),
      end_time: formatTime(today, 16, 0),
      is_all_day: false,
      is_private: true, // Private!
      location: '서울치과병원',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Tomorrow Events
    {
      event_id: 'ev-3',
      calendar_id: 'cal-family',
      creator_id: 'u-3',
      title: '동생 박지은 업무 일정 💻',
      description: '프로젝트 중간 보고서 제출',
      start_time: formatTime(addDays(today, 1), 13, 0),
      end_time: formatTime(addDays(today, 1), 15, 0),
      is_all_day: false,
      is_private: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      event_id: 'ev-4',
      calendar_id: 'cal-friends',
      creator_id: 'u-2',
      title: '이민수 야간 러닝 🏃‍♂️',
      description: '반포 한강공원 코스 5km',
      start_time: formatTime(addDays(today, 1), 19, 30),
      end_time: formatTime(addDays(today, 1), 21, 0),
      is_all_day: false,
      is_private: false,
      location: '반포 한강공원',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // 2 Days Later Events
    {
      event_id: 'ev-5',
      calendar_id: 'cal-friends',
      creator_id: 'u-4',
      title: '최동훈 자격증 시험 준비 📚',
      description: '집중 공부시간',
      start_time: formatTime(addDays(today, 2), 10, 0),
      end_time: formatTime(addDays(today, 2), 14, 0),
      is_all_day: false,
      is_private: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      event_id: 'ev-6',
      calendar_id: 'cal-family',
      creator_id: 'u-1',
      title: '주말 가족 저녁 식사 🍲',
      description: '성수동 맛집 예약',
      start_time: formatTime(addDays(today, 2), 18, 0),
      end_time: formatTime(addDays(today, 2), 20, 0),
      is_all_day: false,
      is_private: false,
      location: '성수동 한식당',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const invitations: Invitation[] = [
    {
      invitation_id: 'inv-1',
      calendar_id: 'cal-family',
      inviter_id: 'u-1',
      invite_code: 'family-invite-token-1234',
      status: 'ACTIVE',
      expires_at: addDays(today, 7).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  return {
    users: DEMO_USERS,
    calendars,
    members,
    events,
    invitations,
  };
}

export function loadAppState(): AppStateData {
  if (typeof window === 'undefined') return getInitialSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveAppState(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
    return getInitialSeedData();
  }
}

export function saveAppState(state: AppStateData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function getCurrentUser(): User {
  if (typeof window === 'undefined') return DEMO_USERS[0];
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return DEMO_USERS[0];
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}
