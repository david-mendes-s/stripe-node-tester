import logger from '../config/logger.config.js';
import {
  stripe,
  handleCheckoutSessionCompleted,
  handleSubscriptionSessionCompleted,
  handleCancelPlan,
} from '../utils/stripe.js';
import { Response, Request } from 'express';

class WebhookController {
  async webhook(req: Request, res: Response): Promise<Response | void> {
    const signature = req.headers['stripe-signature'] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      res.status(400).send(`Webhook Error`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionSessionCompleted(event);
        break;
      case 'customer.subscription.deleted':
        await handleCancelPlan(event);
        break;

      default:
        logger.info(`ℹ️ Unhandled event type: ${event.type}`, {
          eventId: event.id,
          eventType: event.type,
        });
    }

    res.send();
  }
}

export default WebhookController;
