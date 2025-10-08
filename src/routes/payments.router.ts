// src/routes/usersRouter.ts
import { Router, Response, Request, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import PaymentsController from '../controllers/payments.controller.js';
import { AuthRequest } from '../controllers/user.controller.js';

const paymentsRouter = Router();

const paymentsController = new PaymentsController();

paymentsRouter.post(
  '/checkoutSession',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) =>
    paymentsController.createCheckoutSession(req as AuthRequest, res, next),
);

export default paymentsRouter;
