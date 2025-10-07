import Stripe from 'stripe';

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
