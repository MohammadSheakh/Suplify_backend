export enum OrderType {
    standard = 'standard',
    premium = 'premium', 
    vip = 'vip',
}

export enum PaymentMethod {
    //  COD = 'Cod',
    //  CARD = 'Card',
     online = 'online',
}


/**
 * Represents the payment lifecycle states of an order.
 */
export enum PaymentStatus {
  /**
   * Payment has not been made yet.
   */
  unpaid = 'unpaid',

  /**
   * Payment completed successfully.
   */
  paid = 'paid',

  /**
   * Payment was refunded (full or partial).
   */
  refunded = 'refunded',

  /**
   * Payment attempt failed (insufficient funds, declined, or error).
   */
  failed = 'failed',
}

// SUPTODO : we need to compare these order and orderItem module .. with Fertie project .. 

/**
 * Order lifecycle status codes
 */
export enum OrderStatus {
    /**
   * Order placed, but no payment attempt yet.
   */
  pending = 'pending',

  /**
   * Payment is being attempted (checkout in progress).
   */
  processing = 'processing',

  /**
   * Payment completed, order is confirmed, preparing for shipment.
   */
  confirmed = 'confirmed',

  /**
   * Order delivered successfully, transaction closed.
   */
  completed = 'completed',

  /**
   * Delivery failed (lost, wrong address, courier issue, etc).
   */
  didNotReceived = 'didNotReceived',

  /**
   * Customer returned the product (after delivery).
   */
  productReturned = 'productReturned',

  /**
   * Payment attempt failed (insufficient funds, declined, etc).
   */
  failed = 'failed',

  /**
   * Refund processed (can come from didNotReceive, productReturned, or cancelled after payment).
   */
  refunded = 'refunded',

  /**
   * User/admin cancelled before shipment.
   */
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