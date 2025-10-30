// handleStripeError.ts
import { IErrorMessage } from '../types/errors.types';

const handleStripeError = (error: any) => {
  const errorMessages: IErrorMessage[] = [];

  // Handle specific Stripe error types
  switch (error.type) {
    case 'StripeInvalidRequestError':
      errorMessages.push({
        path: error.param || 'stripe',
        message: error.message || 'Invalid request to Stripe API',
      });
      break;

    case 'StripeCardError':
      errorMessages.push({
        path: 'card',
        message: error.message || 'Your card was declined.',
      });
      break;

    case 'StripeAuthenticationError':
      errorMessages.push({
        path: 'authentication',
        message: 'Stripe authentication failed. Please check API keys.',
      });
      break;

    case 'StripeAPIError':
      errorMessages.push({
        path: 'api',
        message: 'Internal Stripe API error. Please try again later.',
      });
      break;

    default:
      errorMessages.push({
        path: 'stripe',
        message: error.message || 'Unknown Stripe error occurred.',
      });
  }

  return {
    code: 400,
    message: 'Stripe operation failed',
    errorMessages,
  };
};

export default handleStripeError;
/*

const handleStripeError = (error: any) => {
  const errorMessages: IErrorMessage[] = [];

  if (error.type === 'StripeInvalidRequestError') {
    errorMessages.push({
      path: error.param || 'stripe',
      message: error.message || 'Invalid request to Stripe API',
    });
  } else if (error.type === 'StripeCardError') {
    errorMessages.push({
      path: 'card',
      message: error.message || 'Your card was declined.',
    });
  } else if (error.type === 'StripeAuthenticationError') {
    errorMessages.push({
      path: 'authentication',
      message: 'Stripe authentication failed. Please check API keys.',
    });
  } else if (error.type === 'StripeAPIError') {
    errorMessages.push({
      path: 'api',
      message: 'Internal Stripe API error. Please try again later.',
    });
  } else {
    errorMessages.push({
      path: 'stripe',
      message: error.message || 'Unknown Stripe error occurred',
    });
  }

  return {
    code: 400,
    message: 'Stripe operation failed',
    errorMessages,
  };
};

export default handleStripeError;
*/