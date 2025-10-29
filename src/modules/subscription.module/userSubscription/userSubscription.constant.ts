export enum UserSubscriptionStatusType {
    processing = 'processing',
    active = 'active',
    past_due = 'past_due',
    cancelled = 'cancelled',
    cancelling = 'cancelling', // From Qwen chat .. for cancel subscription
    unpaid = 'unpaid',
    incomplete = 'incomplete',
    incomplete_expired = 'incomplete_expired',
    trialing = 'trialing',
    freeTrial = 'freeTrial',
    expired = 'expired', 
    payment_failed = 'payment_failed', // From claude .. for handle payment failed
}


