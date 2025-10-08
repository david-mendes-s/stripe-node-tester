import { Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/app-errors.js';
import { generateCheckout } from '../utils/stripe.js';
import { prisma } from '../db/db.postgresql.js';
import PrismaUserRepository from '../repositories/users/prisma.user.repositoy.js';

import { AuthRequest } from './user.controller.js';

const userRepository = new PrismaUserRepository(prisma);

class PaymentsController {
  createCheckoutSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = req.user.id;

      const user = await userRepository.findById(id);

      if (!user) {
        new AppError('User not found', 404);
      }

      const checkout = await generateCheckout(id, user!.email, user!.name);

      return res.status(201).json(checkout);
    } catch (e) {
      next(e);
    }
  };
}

export default PaymentsController;
