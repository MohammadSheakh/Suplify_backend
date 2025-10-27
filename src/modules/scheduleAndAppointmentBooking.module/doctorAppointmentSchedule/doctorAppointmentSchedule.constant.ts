export enum TDoctorAppointmentScheduleStatus {
  available = 'available',
  booked = 'booked',
  cancelled = 'cancelled',  
  expired = 'expired', // TODO : THINK : after when it should be expired ..  
  pending= 'pending', // As per Nirob Vai .. Patient end .. taka pay na korei book hoye gese .. shei issue fix korar try
}

export enum TMeetingLink {
  zoom = 'zoom',
  googleMeet = 'googleMeet',
  others = 'others',
}