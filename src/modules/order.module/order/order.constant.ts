export enum OrderType {
    standard = 'standard',
    premium = 'premium', 
    vip = 'vip',
}

export enum PAYMENT_METHOD {
    //  COD = 'Cod',
    //  CARD = 'Card',
     online = 'online',
}


export enum PAYMENT_STATUS {
     unpaid = 'unpaid',
     paid = 'paid',
     refunded = 'refunded',
}

// SUPTODO : we need to compare these order and orderItem module .. with Fertie project .. 

export enum OrderStatus {
    pending = 'pending',
    processing = 'processing',
    complete = 'complete', 
    failed = 'failed',
    refunded = 'refunded',
    cancelled = 'cancelled',
}
export enum TOrderRelatedTo{
    product = 'product',
    labTest = 'labTest',
    appointment = 'appointment',
    trainingProgram = 'trainingProgram',
    workoutClass = 'workoutClass',
    subscription = 'subscription',
}