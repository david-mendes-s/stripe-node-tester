import { PrismaClient } from '@prisma/client';
import User, { UserWithoutPassword } from '../models/user.model.js';
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
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async upadte(
    id: string,
    user: Partial<Omit<User, 'id'>>,
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
}

export default UserRepository;
