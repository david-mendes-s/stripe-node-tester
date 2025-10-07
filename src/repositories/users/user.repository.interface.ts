import User, { UserWithoutPassword } from '../../models/user.model.js';

export interface IUserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;

  readAll(): Promise<UserWithoutPassword[]>;

  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<UserWithoutPassword | null>;

  update(
    id: string,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserWithoutPassword | null>;
}
