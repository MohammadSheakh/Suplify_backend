import express from 'express';
import { stripeAccountController } from './stripeAccount.controller';

import { USER_ROLES } from '../user/user.enums';
import auth from '../../../middlewares/auth';

// import { auth } from "../../middlewares/auth.js";

const stripeAccountRoutes = express.Router();

// 🔴 UserRoles bolte ki bujhaise ...
stripeAccountRoutes
     .post('/create-connected-account', auth('common'), stripeAccountController.createStripeAccount)
     // .get('/success-account/:id', stripeAccountController.successPageAccount)
     .get('/refreshAccountConnect/:id', stripeAccountController.refreshAccountConnect);

stripeAccountRoutes.get('/success-account/:accountId', stripeAccountController.onConnectedStripeAccountSuccess);

export default stripeAccountRoutes;
