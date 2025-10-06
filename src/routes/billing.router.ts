import { Router } from 'express';
import stripe from '../config/stripe.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../db/db.postgresql.js';
import UserRepository from '../repositories/users/prisma.user.repositoy.js';

const router = Router();
const usersRepo = new UserRepository(prisma);

// Lista branca de planos. Nunca aceite amount do cliente.
const PRICE_MAP: Record<string, string> = {
  pro_month: process.env.STRIPE_PRICE_PRO_MONTH as string,
  // pro_year: process.env.STRIPE_PRICE_PRO_YEAR as string,
};

router.post(
  '/create-checkout-session',
  authenticateToken,
  async (req, res, next) => {
    try {
      const userJwt = (req as AuthRequest).user as {
        id: string;
        username: string;
      };
      const { plan } = req.body as { plan: keyof typeof PRICE_MAP };

      const priceId = PRICE_MAP[plan];
      if (!priceId) {
        return res.status(400).json({ message: 'Plano inválido' });
      }

      // Carrega usuário do banco
      const userDb = await usersRepo.findById(userJwt.id);
      if (!userDb)
        return res.status(404).json({ message: 'Usuário não encontrado' });

      // Opcional: bloquear se já ativo
      if (userDb.subscriptionStatus === 'active') {
        return res.status(400).json({ message: 'Assinatura já ativa' });
      }

      // Se usuário ainda não tem stripeCustomerId, cria um Customer com email e persiste
      if (!userDb.stripeCustomerId) {
        const created = await stripe.customers.create({
          email: userDb.email,
          metadata: { appUserId: userDb.id },
        });
        await usersRepo.updateStripeInfo(userDb.id, {
          stripeCustomerId: created.id,
        });
        userDb.stripeCustomerId = created.id;
      }

      const session = await stripe.checkout.sessions.create(
        {
          mode: 'subscription',
          customer: userDb.stripeCustomerId,
          line_items: [{ price: priceId, quantity: 1 }],
          allow_promotion_codes: true,
          success_url:
            (process.env.FRONTEND_URL || 'http://localhost:5173') +
            '/billing/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url:
            (process.env.FRONTEND_URL || 'http://localhost:5173') +
            '/billing/cancel',
          metadata: { appUserId: userJwt.id, plan },
        },
        { idempotencyKey: `checkout_${userJwt.id}_${plan}` },
      );

      return res.json({ url: session.url });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  '/create-portal-session',
  authenticateToken,
  async (req, res, next) => {
    try {
      // Em produção, pegue do DB: const customerId = user.stripeCustomerId
      const { customerId } = req.body as { customerId: string };
      if (!customerId)
        return res.status(400).json({ message: 'customerId ausente' });

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url:
          (process.env.FRONTEND_URL || 'http://localhost:5173') + '/account',
      });

      return res.json({ url: session.url });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
