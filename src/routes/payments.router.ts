// src/routes/usersRouter.ts
import { Router, Response, Request, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.js';

import { prisma } from '../db/db.postgresql.js';

import PrismaUserRepository from '../repositories/users/prisma.user.repositoy.js';
import { AppError } from '../utils/errors/app-errors.js';
import { generateCheckout } from '../utils/stripe.js';

const paymentsRouter = Router();

const userRepository = new PrismaUserRepository(prisma);

paymentsRouter.post(
  '/checkoutSession',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user.id;

      const user = await userRepository.findById(id);

      if (!user) {
        new AppError('User not found', 404);
      }

      const checkout = await generateCheckout(id, user.email, user.name);

      return res.status(201).json(checkout);
    } catch (e) {
      next(e);
    }
  },
);

export default paymentsRouter;
