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




// ==================== For Workout class creation issue fix
// 1. Fix combineDateAndTime to return a Luxon DateTime in the correct zone
export const combineDateAndTimeV2 = (date: Date | string, timeString: string, userTimeZone: string): DateTime => {
    // Parse the date part into a DateTime object first
    let dt: DateTime;
    
    if (date instanceof Date) {
        // Convert JS Date to ISO string to be safe, then parse
        dt = DateTime.fromJSDate(date); 
    } else {
        dt = DateTime.fromISO(date);
    }

    // Ensure we are working in the user's timezone context for the DATE part
    // This ensures the "day" is interpreted correctly relative to the timezone
    dt = dt.setZone(userTimeZone);

    const [hours, minutes, seconds = '0'] = timeString.split(':');
    
    // Set the time components directly in the specified timezone
    return dt.set({
        hour: parseInt(hours, 10),
        minute: parseInt(minutes, 10),
        second: parseInt(seconds, 10),
        millisecond: 0
    });
};

export const combineDateAndTimeV3 = (date: Date, timeString: string, userTimeZone: string): Date => {
    // timeString format: "14:30:00" (24-hour format)
    const [hours, minutes, seconds = '0'] = timeString.split(':');
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Luxon months are 1-indexed!
    const day = date.getDate();
    
    // Create datetime in the USER's timezone
    const combined = DateTime.fromObject(
        {
            year,
            month,
            day,
            hour: parseInt(hours, 10),
            minute: parseInt(minutes, 10),
            second: parseInt(seconds, 10),
        },
        { zone: userTimeZone }
    );
    
    return combined.toJSDate();
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