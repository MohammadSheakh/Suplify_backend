/********
 * 
 * we use this function to format delay time in milliseconds to a more human-readable format
 * calling this function in add job into bullmq
 * 
 * in doctorPatientScheduleBooking.service.ts
 * in specialistPatientScheduleBooking.service.ts
 * 
 * ***** */
export function formatDelay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0 && seconds > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
}