import User, { UserWithoutPassword } from '../models/user.model.js';

export interface IUserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;

  readAll(): Promise<UserWithoutPassword[]>;

  findByEmail(email: string): Promise<User | null>;

  upadte(
    id: string,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserWithoutPassword | null>;
}
