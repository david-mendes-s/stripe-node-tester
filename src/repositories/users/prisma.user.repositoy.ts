import { PrismaClient } from '@prisma/client';
import User, { UserWithoutPassword } from '../../models/user.model.js';
import { IUserRepository } from './user.repository.interface.js';
import logger from '../../config/logger.config.js';

class UserRepository implements IUserRepository {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaClient) { }

  async create(user: User): Promise<User> {
    return await this.prisma.user.create({ data: user });
  }

  async readAll(): Promise<UserWithoutPassword[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    user: Partial<
      Omit<
        User,
        | 'id'
        | 'stripeSubscriptionStatus'
        | 'stripeCustomerId'
        | 'stripeSubscriptionId'
      >
    >,
  ): Promise<UserWithoutPassword | null> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado ou sem permissão');
    }

    return await this.prisma.user.update({
      where: { id },
      data: user,
      select: { id: true, name: true, email: true },
    });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
      },
    });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserWithoutPassword | null> {
    return await this.prisma.user.findFirst({
      where: { stripeCustomerId },
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
      },
    });
  }

  async updateCheckoutSessionCompleted(
    id: string,
    user: Partial<Omit<User, 'id' | 'password' | 'email' | 'name'>>,
  ) {
    logger.info('💾 Updating user checkout session data', {
      userId: id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
    });

    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      logger.error('❌ User not found for checkout update', { userId: id });
      throw new Error('Usuário não encontrado ou sem permissão');
    }

    logger.info('✅ User found, proceeding with checkout update', {
      userId: id,
      currentStripeCustomerId: existingUser.stripeCustomerId,
      currentStripeSubscriptionId: existingUser.stripeSubscriptionId,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      },
    });

    logger.info('✅ User checkout data updated successfully', {
      userId: id,
      newStripeCustomerId: updatedUser.stripeCustomerId,
      newStripeSubscriptionId: updatedUser.stripeSubscriptionId,
    });
  }

  async updateSubscriptionSessionCompleted(
    userId: string,
    subscriptionStatus: string,
    subscriptionId: string,
    stripeCustumerId: string,
  ): Promise<void> {
    logger.info('💾 Updating user subscription data', {
      userId,
      subscriptionStatus,
      subscriptionId,
      stripeCustumerId,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error('❌ User not found for subscription update', { userId });
      throw new Error('Usuário não encontrado');
    }

    logger.info('✅ User found, proceeding with subscription update', {
      userId,
      currentStripeSubscriptionStatus: user.stripeSubscriptionStatus,
      currentStripeSubscriptionId: user.stripeSubscriptionId,
      currentStripeCustomerId: user.stripeCustomerId,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionStatus: subscriptionStatus,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: stripeCustumerId,
      },
    });

    logger.info('✅ User subscription data updated successfully', {
      userId,
      newStripeSubscriptionStatus: updatedUser.stripeSubscriptionStatus,
      newStripeSubscriptionId: updatedUser.stripeSubscriptionId,
      newStripeCustomerId: updatedUser.stripeCustomerId,
    });
  }

  async updateCancelPlan(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    logger.info('💾 Cancelling user subscription', {
      userId,
      stripeCustomerId,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error('❌ User not found for subscription cancellation', {
        userId,
      });
      throw new Error('Usuário não encontrado');
    }

    logger.info('✅ User found, proceeding with subscription cancellation', {
      userId,
      currentStripeSubscriptionStatus: user.stripeSubscriptionStatus,
      currentStripeSubscriptionId: user.stripeSubscriptionId,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: stripeCustomerId,
        stripeSubscriptionStatus: null,
      },
    });

    logger.info('✅ User subscription cancelled successfully', {
      userId,
      newStripeSubscriptionStatus: updatedUser.stripeSubscriptionStatus,
      stripeCustomerId: updatedUser.stripeCustomerId,
    });
  }
}

export default UserRepository;
