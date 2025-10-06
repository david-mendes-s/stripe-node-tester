import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import bodyParser from 'body-parser';
import stripe from './config/stripe.js';
import { prisma } from './db/db.postgresql.js';
import UserRepository from './repositories/users/prisma.user.repositoy.js';
import logger from './config/logger.config.js';
const usersRepo = new UserRepository(prisma);

export const app = express();

// Webhook Stripe: precisa do corpo raw antes de qualquer JSON parser
app.post(
  '/webhooks/stripe',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'] as string;
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as {
            id: string;
            customer?: string;
            subscription?: string;
            metadata?: { appUserId?: string };
          };
          const customerId = session.customer as string | null;
          const subscriptionId = session.subscription as string | null;
          const appUserId = session.metadata?.appUserId as string | undefined;

          logger.info(
            `stripe webhook checkout.session.completed customer=${customerId} sub=${subscriptionId} appUserId=${appUserId}`,
          );

          if (appUserId && customerId) {
            await usersRepo.updateStripeInfo(appUserId, {
              stripeCustomerId: customerId,
              ...(subscriptionId
                ? { stripeSubscriptionId: subscriptionId }
                : {}),
            });
          }

          // Em alguns casos a session não vem com subscription expandida
          try {
            const fullSession = await stripe.checkout.sessions.retrieve(
              session.id,
              {
                expand: ['subscription'],
              },
            );
            const sub = fullSession.subscription as {
              id: string;
              status?: string;
            } | null;
            if (customerId && sub?.id) {
              await usersRepo.updateByStripeCustomerId(customerId, {
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
              });
            }
          } catch (e) {
            logger.warn(
              `could not expand session.subscription: ${(e as Error).message}`,
            );
          }
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const sub = event.data.object as {
            id: string;
            customer: string;
            status?: string;
          };
          logger.info(
            `stripe webhook ${event.type} customer=${sub.customer} sub=${sub.id} status=${sub.status}`,
          );
          await usersRepo.updateByStripeCustomerId(sub.customer, {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
          });
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object as {
            customer: string;
            subscription?: string;
          };
          const customerId = invoice.customer as string;
          const subscriptionId = invoice.subscription as string | null;
          logger.info(
            `stripe webhook invoice.paid customer=${customerId} sub=${subscriptionId}`,
          );
          await usersRepo.updateByStripeCustomerId(customerId, {
            subscriptionStatus: 'active',
            ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          });
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as { customer: string };
          const customerId = invoice.customer as string;
          logger.warn(
            `stripe webhook invoice.payment_failed customer=${customerId}`,
          );
          await usersRepo.updateByStripeCustomerId(customerId, {
            subscriptionStatus: 'past_due',
          });
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as { customer: string };
          const customerId = sub.customer as string;
          logger.warn(
            `stripe webhook customer.subscription.deleted customer=${customerId}`,
          );
          await usersRepo.updateByStripeCustomerId(customerId, {
            subscriptionStatus: 'canceled',
          });
          break;
        }
        default: {
          logger.debug(`stripe webhook ignored event type=${event.type}`);
          break;
        }
      }

      return res.json({ received: true });
    } catch (err) {
      logger.error(`stripe webhook error ${(err as Error).message}`);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
  },
);

app.use(express.json());
app.use(cookieParser());

// Middleware de log para todas as requisições
app.use(requestLogger);

// Chamada para Rotas
app.use(router);

// Middleware de tratamento de erros (deve ser registrado após as rotas)
app.use(errorHandler);

export default app;
