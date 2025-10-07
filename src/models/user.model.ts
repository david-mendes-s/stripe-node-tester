interface User {
  id: string;
  name: string;
  email: string;
  password: string;

  stripeSubscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;

  stripeSubscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export default User;
