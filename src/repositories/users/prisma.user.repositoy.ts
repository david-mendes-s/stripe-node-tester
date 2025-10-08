import { PrismaClient } from '@prisma/client';
import User, { UserWithoutPassword } from '../../models/user.model.js';
import { IUserRepository } from './user.repository.interface.js';

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
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findByStripeCustomerId(customerId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
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

  async updateCheckoutSessionCompleted(
    id: string,
    user: Partial<Omit<User, 'id' | 'password' | 'email' | 'name'>>,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado ou sem permissão');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      },
    });
  }

  async updateSubscriptionSessionCompleted(
    subscriptionStatus: string,
    subscriptionId: string,
    stripeCustumerId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: stripeCustumerId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: subscriptionStatus,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: stripeCustumerId,
      },
    });
  }

  async updateCancelPlan(stripeCustumerId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: stripeCustumerId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: stripeCustumerId,
        stripeSubscriptionStatus: null,
      },
    });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserWithoutPassword | null> {
    return await this.prisma.user.findUnique({
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
}

export default UserRepository;
