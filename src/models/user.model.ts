interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
}

export default User;
