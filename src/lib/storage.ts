import { User, Calendar, CalendarMember, CalendarEvent, Invitation } from '@/types';

// V2 Storage Keys to cleanly bypass legacy demo data stored in user browsers
const STORAGE_KEY = 'moyeobwa_calendar_data_v2';
const CURRENT_USER_KEY = 'moyeobwa_current_user_v2';

export interface AppStateData {
  users: User[];
  calendars: Calendar[];
  members: CalendarMember[];
  events: CalendarEvent[];
  invitations: Invitation[];
}

/**
 * Creates clean initial data for a real user with a personal calendar and 0 mock events.
 */
export function createInitialUserData(user: User): AppStateData {
  const personalCalId = `cal-personal-${user.user_id}`;
  const personalCalendar: Calendar = {
    calendar_id: personalCalId,
    owner_id: user.user_id,
    name: '내 캘린더',
    description: `${user.nickname}님의 개인 일정`,
    color_code: '#3B82F6',
    is_personal: true,
    created_at: new Date().toISOString(),
  };

  const member: CalendarMember = {
    member_id: `m-${Date.now()}`,
    calendar_id: personalCalId,
    user_id: user.user_id,
    role: 'OWNER',
    joined_at: new Date().toISOString(),
  };

  return {
    users: [user],
    calendars: [personalCalendar],
    members: [member],
    events: [],
    invitations: [],
  };
}

export function loadAppState(currentUser?: User | null): AppStateData {
  if (typeof window === 'undefined') {
    return currentUser
      ? createInitialUserData(currentUser)
      : { users: [], calendars: [], members: [], events: [], invitations: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AppStateData = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.calendars) && parsed.calendars.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  if (currentUser) {
    const initial = createInitialUserData(currentUser);
    saveAppState(initial);
    return initial;
  }

  return {
    users: [],
    calendars: [],
    members: [],
    events: [],
    invitations: [],
  };
}

export function saveAppState(state: AppStateData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed: User = JSON.parse(raw);
      // Ensure it is not a legacy hardcoded mock user
      if (parsed && parsed.user_id && parsed.user_id !== 'u-1' && !parsed.nickname?.includes('김카카오')) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return null;
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  // Also remove legacy keys if present
  localStorage.removeItem('moyeobwa_calendar_data_v1');
  localStorage.removeItem('moyeobwa_current_user_v1');
}
