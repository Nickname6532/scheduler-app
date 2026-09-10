export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
  user_id: string;
  kakao_id: string;
  email?: string;
  nickname: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Calendar {
  calendar_id: string;
  owner_id: string;
  name: string;
  description?: string;
  color_code: string;
  is_personal: boolean;
  created_at: string;
  members?: CalendarMember[];
}

export interface CalendarMember {
  member_id: string;
  calendar_id: string;
  user_id: string;
  role: MemberRole;
  display_color?: string;
  joined_at: string;
  user?: User;
}

export interface CalendarEvent {
  event_id: string;
  calendar_id: string;
  creator_id: string;
  title: string;
  description?: string;
  start_time: string; // ISO string in UTC or local
  end_time: string;   // ISO string in UTC or local
  is_all_day: boolean;
  is_private: boolean; // Private: shown as "바쁨" (Busy) to others
  location?: string;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface Invitation {
  invitation_id: string;
  calendar_id: string;
  inviter_id: string;
  invite_code: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  expires_at: string;
  created_at: string;
  calendar?: Calendar;
  inviter?: User;
}

export interface FreeSlot {
  start_time: string; // ISO string
  end_time: string;   // ISO string
  durationMinutes: number;
  dateStr: string;    // YYYY-MM-DD
  startTimeStr: string; // HH:mm
  endTimeStr: string;   // HH:mm
  participants: User[];
  recommendationTag?: string; // e.g. "점심 후 2시간", "저녁시간"
}

export interface FreeBusyParams {
  calendarId: string;
  memberUserIds: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  activeStartHour: number; // e.g. 9 for 09:00
  activeEndHour: number;   // e.g. 22 for 22:00
  minDurationMinutes: number; // e.g. 30, 60, 120
}
