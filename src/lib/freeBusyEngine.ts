import { CalendarEvent, FreeSlot, FreeBusyParams, User } from '@/types';
import { parseISO, format, isBefore, isAfter, addDays, setHours, setMinutes, setSeconds, differenceInMinutes } from 'date-fns';

export function calculateFreeSlots(
  events: CalendarEvent[],
  params: FreeBusyParams,
  members: User[]
): FreeSlot[] {
  const {
    memberUserIds,
    startDate,
    endDate,
    activeStartHour,
    activeEndHour,
    minDurationMinutes,
  } = params;

  // Filter events belonging to selected members and intersecting date range
  const relevantEvents = events.filter((ev) => {
    // If event has creator_id, check if in selected members
    if (ev.creator_id && memberUserIds.length > 0 && !memberUserIds.includes(ev.creator_id)) {
      return false;
    }
    return true;
  });

  const freeSlots: FreeSlot[] = [];

  const startDay = new Date(`${startDate}T00:00:00`);
  const endDay = new Date(`${endDate}T23:59:59`);

  let currentDay = new Date(startDay);

  while (currentDay <= endDay) {
    const dayStr = format(currentDay, 'yyyy-MM-dd');
    const dayStart = setSeconds(setMinutes(setHours(new Date(currentDay), activeStartHour), 0), 0);
    const dayEnd = setSeconds(setMinutes(setHours(new Date(currentDay), activeEndHour), 0), 0);

    const dayStartMs = dayStart.getTime();
    const dayEndMs = dayEnd.getTime();

    if (dayStartMs >= dayEndMs) {
      currentDay = addDays(currentDay, 1);
      continue;
    }

    // Collect all busy intervals for currentDay within active hours
    const busyIntervals: { start: number; end: number }[] = [];

    for (const ev of relevantEvents) {
      const evStart = parseISO(ev.start_time).getTime();
      const evEnd = parseISO(ev.end_time).getTime();

      // Check overlap with active window [dayStartMs, dayEndMs]
      if (evEnd > dayStartMs && evStart < dayEndMs) {
        const clampedStart = Math.max(evStart, dayStartMs);
        const clampedEnd = Math.min(evEnd, dayEndMs);

        if (clampedEnd > clampedStart) {
          busyIntervals.push({ start: clampedStart, end: clampedEnd });
        }
      }
    }

    // Sort busy intervals by start time
    busyIntervals.sort((a, b) => a.start - b.start);

    // Merge overlapping/adjacent busy intervals
    const mergedBusy: { start: number; end: number }[] = [];
    for (const interval of busyIntervals) {
      if (mergedBusy.length === 0) {
        mergedBusy.push({ ...interval });
      } else {
        const last = mergedBusy[mergedBusy.length - 1];
        if (interval.start <= last.end) {
          last.end = Math.max(last.end, interval.end);
        } else {
          mergedBusy.push({ ...interval });
        }
      }
    }

    // Invert to get free intervals
    let freePointer = dayStartMs;
    for (const busy of mergedBusy) {
      if (busy.start > freePointer) {
        const dur = Math.floor((busy.start - freePointer) / (1000 * 60));
        if (dur >= minDurationMinutes) {
          const slotStart = new Date(freePointer);
          const slotEnd = new Date(busy.start);

          freeSlots.push(
            createFreeSlot(slotStart, slotEnd, dur, dayStr, members)
          );
        }
      }
      freePointer = Math.max(freePointer, busy.end);
    }

    // Check tail free interval after last busy until dayEnd
    if (dayEndMs > freePointer) {
      const dur = Math.floor((dayEndMs - freePointer) / (1000 * 60));
      if (dur >= minDurationMinutes) {
        const slotStart = new Date(freePointer);
        const slotEnd = new Date(dayEndMs);

        freeSlots.push(
          createFreeSlot(slotStart, slotEnd, dur, dayStr, members)
        );
      }
    }

    currentDay = addDays(currentDay, 1);
  }

  return freeSlots;
}

function createFreeSlot(
  start: Date,
  end: Date,
  durationMinutes: number,
  dateStr: string,
  participants: User[]
): FreeSlot {
  const startTimeStr = format(start, 'HH:mm');
  const endTimeStr = format(end, 'HH:mm');
  const hour = start.getHours();

  let recommendationTag = '추천 시간';
  if (hour >= 9 && hour < 12) {
    recommendationTag = '🌅 오전 여유 시간';
  } else if (hour >= 12 && hour < 14) {
    recommendationTag = '🍱 점심 / 커피 타임';
  } else if (hour >= 14 && hour < 18) {
    recommendationTag = '☕ 오후 집중 / 모임 시간';
  } else if (hour >= 18 && hour < 22) {
    recommendationTag = '🌙 저녁 약속 추천';
  }

  if (durationMinutes >= 180) {
    recommendationTag += ' (3시간 이상 넉넉함)';
  }

  return {
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    durationMinutes,
    dateStr,
    startTimeStr,
    endTimeStr,
    participants,
    recommendationTag,
  };
}
