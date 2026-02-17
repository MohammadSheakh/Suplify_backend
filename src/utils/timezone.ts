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

export const toUTCTimeV2 = (dateString: Date | string, zone: string = 'Asia/Dhaka'): Date => {
  // If it's already a Date object, convert to ISO string first
  const isoString = dateString instanceof Date ? dateString.toISOString() : dateString;
  
  return DateTime.fromISO(isoString, { zone })
    .toUTC()
    .toJSDate();
};

// Helper function to combine date and time
export const combineDateAndTime = (date: Date, timeString: string, userTimeZone: string): Date => {
    // timeString format: "14:30:00" (24-hour format)
    const [hours, minutes, seconds = '0'] = timeString.split(':');
    
    // Create a new date object with the date from 'date' and time from 'timeString'
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const combined = new Date(year, month, day, parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10), 0);
    
    return combined;
}

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