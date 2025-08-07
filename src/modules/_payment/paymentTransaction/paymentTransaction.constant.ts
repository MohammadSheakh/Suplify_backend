export enum TTransactionFor {
    subscription = 'subscription',
    order = 'order'
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