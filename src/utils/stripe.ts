import Stripe from 'stripe';
import { prisma } from '../db/db.postgresql.js';
import UserRepository from '../repositories/users/prisma.user.repositoy.js';
import logger from '../config/logger.config.js';

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
    logger.info('🛒 Starting checkout session creation', {
      userId,
      email,
      name,
    });

    const customer = await createStripeCustomer({ name, email });
    logger.info('✅ Stripe customer created/found', {
      customerId: customer.id,
      email: customer.email,
    });

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

    logger.info('✅ Checkout session created successfully', {
      sessionId: session.id,
      userId,
      customerId: customer.id,
      url: session.url,
    });

    return {
      url: session.url,
    };
  } catch (error) {
    logger.error('❌ Error creating checkout session', {
      userId,
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno do servidor';
    throw new Error(errorMessage);
  }
};

export const handleCheckoutSessionCompleted = async (event: {
  data: { object: Stripe.Checkout.Session };
}) => {
  const idUserReferenceStripe = event.data.object.client_reference_id as string;
  const stripeSubscriptionId = event.data.object.subscription as string;
  const stripeCustomerId = event.data.object.customer as string;
  const checkoutStatus = event.data.object.status;

  // Log dos dados recebidos
  logger.info('🛒 Checkout session completed data received', {
    idUserReferenceStripe,
    stripeSubscriptionId,
    stripeCustomerId,
    checkoutStatus,
    sessionId: event.data.object.id,
  });

  if (checkoutStatus !== 'complete') {
    logger.warn('⚠️ Checkout status is not complete', {
      checkoutStatus,
      sessionId: event.data.object.id,
    });
    return;
  }

  if (!idUserReferenceStripe || !stripeSubscriptionId || !stripeCustomerId) {
    logger.error('❌ Missing required checkout data', {
      idUserReferenceStripe: !!idUserReferenceStripe,
      stripeSubscriptionId: !!stripeSubscriptionId,
      stripeCustomerId: !!stripeCustomerId,
    });
    throw new Error(
      'idUser, stripeSubscriptionId, stripeCustumerId is required',
    );
  }

  logger.info('🔍 Looking for user by ID', { userId: idUserReferenceStripe });
  const isUserExists = await userRepository.findById(idUserReferenceStripe);

  if (!isUserExists) {
    logger.error('❌ User not found', { userId: idUserReferenceStripe });
    throw new Error('User not found');
  }

  logger.info('✅ User found, updating checkout data', {
    userId: idUserReferenceStripe,
    stripeCustomerId,
    stripeSubscriptionId,
  });

  // Usar o ID do client_reference_id, não do JWT
  await userRepository.updateCheckoutSessionCompleted(idUserReferenceStripe, {
    stripeCustomerId,
    stripeSubscriptionId,
  });

  logger.info('✅ User updated successfully with checkout data', {
    userId: idUserReferenceStripe,
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

  // Log dos dados recebidos
  logger.info('📋 Subscription event data received', {
    subscriptionStatus,
    stripeCustumerId,
    stripeSubscriptionId,
  });

  // Buscar usuário pelo customer ID
  logger.info('🔍 Looking for user by Stripe customer ID', {
    stripeCustumerId,
  });
  const user = await userRepository.findByStripeCustomerId(stripeCustumerId);

  if (!user) {
    logger.error('❌ User not found by Stripe customer ID', {
      stripeCustumerId,
    });
    throw new Error('User not found');
  }

  logger.info('✅ User found, updating subscription data', {
    userId: user.id,
    subscriptionStatus,
    stripeSubscriptionId,
    stripeCustumerId,
  });

  await userRepository.updateSubscriptionSessionCompleted(
    user.id,
    subscriptionStatus,
    stripeSubscriptionId,
    stripeCustumerId,
  );

  logger.info('✅ User subscription updated successfully', {
    userId: user.id,
    subscriptionStatus,
    stripeSubscriptionId,
    stripeCustumerId,
  });
};

export const handleCancelPlan = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const stripeCustumerId = event.data.object.customer as string;

  // Log dos dados recebidos
  logger.info('🗑️ Subscription cancellation data received', {
    stripeCustumerId,
    subscriptionId: event.data.object.id,
  });

  // Buscar usuário pelo customer ID
  logger.info('🔍 Looking for user by Stripe customer ID for cancellation', {
    stripeCustumerId,
  });
  const user = await userRepository.findByStripeCustomerId(stripeCustumerId);

  if (!user) {
    logger.error('❌ User not found for cancellation', {
      stripeCustumerId,
    });
    throw new Error('User not found');
  }

  logger.info('✅ User found, cancelling subscription', {
    userId: user.id,
    stripeCustumerId,
  });

  await userRepository.updateCancelPlan(user.id, stripeCustumerId);

  logger.info('✅ User subscription cancelled successfully', {
    userId: user.id,
    stripeCustumerId,
  });
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
