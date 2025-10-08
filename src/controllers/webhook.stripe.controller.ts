import {
  stripe,
  handleCheckoutSessionCompleted,
  handleSubscriptionSessionCompleted,
  handleCancelPlan,
} from '../utils/stripe.js';
import { Request, Response } from 'express';
import logger from '../config/logger.config.js';

class WebhookController {
  async webhook(req: Request, res: Response): Promise<Response | void> {
    const signature = req.headers['stripe-signature'] as string;

    // Log da requisição do webhook
    logger.info('🔔 Webhook received', {
      signature: signature ? 'present' : 'missing',
      bodySize: req.body?.length || 0,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
      },
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );

      // Log do evento recebido
      logger.info('✅ Webhook event constructed successfully', {
        type: event.type,
        id: event.id,
        created: event.created,
      });
    } catch (error) {
      logger.error('❌ Webhook signature verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        signature: signature ? 'present' : 'missing',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
          ? 'configured'
          : 'missing',
      });
      res
        .status(400)
        .send(
          `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          logger.info('🛒 Processing checkout.session.completed', {
            sessionId: event.data.object.id,
            customerId: event.data.object.customer,
            clientReferenceId: event.data.object.client_reference_id,
          });
          await handleCheckoutSessionCompleted(event);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          logger.info('📋 Processing subscription event', {
            type: event.type,
            subscriptionId: event.data.object.id,
            customerId: event.data.object.customer,
            status: event.data.object.status,
          });
          await handleSubscriptionSessionCompleted(event);
          break;
        case 'customer.subscription.deleted':
          logger.info('🗑️ Processing subscription deleted', {
            subscriptionId: event.data.object.id,
            customerId: event.data.object.customer,
          });
          await handleCancelPlan(event);
          break;
        default:
          logger.info(`ℹ️ Unhandled event type: ${event.type}`, {
            eventId: event.id,
            eventType: event.type,
          });
      }

      // Log de sucesso
      logger.info('✅ Webhook processed successfully', {
        type: event.type,
        eventId: event.id,
      });
    } catch (error) {
      // Log de erro detalhado
      logger.error('❌ Webhook processing failed', {
        type: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      res
        .status(500)
        .send(
          `Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      return;
    }

    res.send();
  }
}

export default WebhookController;
