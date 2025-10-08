import Stripe from 'stripe';
import { prisma } from '../db/db.postgresql.js';
import UserRepository from '../repositories/users/prisma.user.repositoy.js';

const userRepository = new UserRepository(prisma);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  httpClient: Stripe.createFetchHttpClient(),
});

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({
    email,
  });

  return customers.data[0];
};

export const createStripeCustomer = async (data: {
  name: string;
  email: string;
}) => {
  const customer = await getStripeCustomerByEmail(data?.email);

  if (customer) {
    return customer;
  }

  return stripe.customers.create({
    name: data?.name,
    email: data?.email,
  });
};

export const generateCheckout = async (
  userId: string,
  email: string,
  name: string,
) => {
  try {
    const customer = await createStripeCustomer({ name, email });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id,
      client_reference_id: userId,
      success_url: process.env.FRONTEND_URL + '/success',
      cancel_url: process.env.FRONTEND_URL + '/canceled',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PRO_MONTH,
          quantity: 1,
        },
      ],
    });

    return {
      url: session.url,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno do servidor';
    new Error(errorMessage);
  }
};

export const handleCheckoutSessionCompleted = async (event: {
  data: { object: Stripe.Checkout.Session };
}) => {
  const idUserReferenceStripe = event.data.object.client_reference_id as string;
  const stripeSubscriptionId = event.data.object.subscription as string;
  const stripeCustomerId = event.data.object.customer as string;
  const checkoutStatus = event.data.object.status;

  if (checkoutStatus !== 'complete') return;

  if (!idUserReferenceStripe || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error(
      'idUser, stripeSubscriptionId, stripeCustumerId is required',
    );
  }

  const isUserExists = await userRepository.findById(idUserReferenceStripe);

  if (!isUserExists) {
    throw new Error('User not found');
  }

  await userRepository.updateCheckoutSessionCompleted(idUserReferenceStripe, {
    stripeCustomerId,
    stripeSubscriptionId,
  });
};

export const handleSubscriptionSessionCompleted = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const subscriptionStatus = event.data.object.status;
  const stripeCustumerId = event.data.object.customer as string;
  const stripeSubscriptionId = event.data.object.id as string;

  const user = userRepository.findByStripeCustomerId(stripeCustumerId);

  if (!user) {
    throw new Error('User not found');
  }

  await userRepository.updateSubscriptionSessionCompleted(
    subscriptionStatus,
    stripeSubscriptionId,
    stripeCustumerId,
  );
};

export const handleCancelPlan = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const stripeCustumerId = event.data.object.customer as string;

  const user = await userRepository.findByStripeCustomerId(stripeCustumerId);

  if (!user) {
    throw new Error('User not found');
  }

  if (stripeCustumerId !== user.stripeCustomerId) {
    throw new Error('This user does not have permission to cancel the plan');
  }

  await userRepository.updateCancelPlan(stripeCustumerId);
};

export const handleCancelSubscription = async (idSubscriptions: string) => {
  const subscription = await stripe.subscriptions.update(idSubscriptions, {
    cancel_at_period_end: true,
  });

  return subscription;
};

export const createPortalCustomer = async (idCustomer: string) => {
  const subscription = await stripe.billingPortal.sessions.create({
    customer: idCustomer,
    return_url: process.env.FRONTEND_URL,
  });

  return subscription;
};
