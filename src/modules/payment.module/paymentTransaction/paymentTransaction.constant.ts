export enum TTransactionFor {
    subscription = 'subscription',
    productOrder = 'productOrder',
    doctorAppointment = 'doctorAppointment',
    workoutClass = 'workoutClass',
    trainingProgram = 'trainingProgram',
    labTestBooking = 'labTestBooking',
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