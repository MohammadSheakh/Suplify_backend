export enum TTransactionFor {
    SubscriptionPlan = 'SubscriptionPlan',
    Order = 'Order',
    DoctorPatientScheduleBooking = 'DoctorPatientScheduleBooking',
    SpecialistPatientScheduleBooking = 'SpecialistPatientScheduleBooking',
    TrainingProgramPurchase = 'TrainingProgramPurchase',
    LabTestBooking = 'LabTestBooking',
}
export enum TPaymentGateway {
    stripe = 'stripe',
    paypal = 'paypal',
    none = 'none'
}
export enum TPaymentStatus {
    pending = 'pending',
    processing = 'processing',
    completed = 'completed',
    failed = 'failed',
    refunded = 'refunded',
    cancelled = 'cancelled',
    partially_refunded = 'partially_refunded',
    disputed = 'disputed'
}