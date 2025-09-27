export const notificationFilters: string[] = ['receiverId'];

/***********
 * 
 * INotificationType must contain all the referenceFor values from TTransactionFor enum
 * 
 * ***** */
export enum TNotificationType {
    // SubscriptionPlan = 'SubscriptionPlan',
    booking = 'booking',
    training = 'training',
    workout = 'workout',
    withdrawal = 'withdrawal',
    payment = 'payment',
    system = 'system',
}