import User, { UserWithoutPassword } from '../../models/user.model.js';

export interface IUserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;

  readAll(): Promise<UserWithoutPassword[]>;

  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<UserWithoutPassword | null>;

  findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserWithoutPassword | null>;

  update(
    id: string,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserWithoutPassword | null>;

  updateCheckoutSessionCompleted(
    id: string,
    user: Partial<Omit<User, 'id' | 'password' | 'email' | 'name'>>,
  ): Promise<void>;

  updateSubscriptionSessionCompleted(
    userId: string,
    subscriptionStatus: string,
    subscriptionId: string,
    stripeCustumerId: string,
  ): Promise<void>;

  updateCancelPlan(userId: string, stripeCustomerId: string): Promise<void>;
}
