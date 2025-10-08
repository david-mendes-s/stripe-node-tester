import {
  stripe,
  handleCheckoutSessionCompleted,
  handleSubscriptionSessionCompleted,
  handleCancelPlan,
} from '../utils/stripe.js';
import { Response } from 'express';
import { AuthRequest } from './user.controller.js';

class WebhookController {
  async webhook(req: AuthRequest, res: Response): Promise<Response | void> {
    const signature = req.headers['stripe-signature'] as string;

    const userId = req.user.id;

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
        await handleCheckoutSessionCompleted(event, userId);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionSessionCompleted(event, userId);
        break;
      case 'customer.subscription.deleted':
        await handleCancelPlan(event, userId);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  }
}

export default WebhookController;
