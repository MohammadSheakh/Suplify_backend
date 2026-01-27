import { DateTime } from 'luxon';

export const toLocalTime = (date: Date | string | null, zone: string = 'Asia/Dhaka'): string | null => {
  if (!date) return null;
  return DateTime.fromJSDate(new Date(date))
    .setZone(zone)
    .toFormat("yyyy-MM-dd'T'HH:mm:ss");
};

export const toUTCTime = (dateString: Date | string, zone: string = 'Asia/Dhaka'): Date => {
  return DateTime.fromISO(dateString, { zone })
    .toUTC()
    .toJSDate();
};

export const mergeDateAndTime = (date: Date, time: Date) => {
    const merged = new Date(date);
    merged.setHours(
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        time.getMilliseconds()
    );
    return merged;
}

export const  buildLocalDateTime = (
  date: Date,
  time: string | Date
): Date => {
  const { h, m } = parseTimeString(time);

  const result = new Date(date);
  result.setHours(h, m, 0, 0);

  if (isNaN(result.getTime())) {
    throw new Error('Invalid combined date-time');
  }

  return result;
}

function parseTimeString(time: string | Date): { h: number; m: number } {
  if (time instanceof Date && !isNaN(time.getTime())) {
    return { h: time.getHours(), m: time.getMinutes() };
  }

  if (typeof time !== 'string') {
    throw new Error('Invalid time format');
  }

  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid time string: ${time}`);
  }

  return {
    h: Number(match[1]),
    m: Number(match[2]),
  };
}