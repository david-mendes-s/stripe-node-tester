import User, { UserWithoutPassword } from '../models/user.model.js';

export interface IUserService {
  createUser(userData: Omit<User, 'id'>): Promise<void>;

  getAll(): Promise<UserWithoutPassword[]>;

  updateUser(
    id: string,
    userData: Partial<Omit<User, 'id'>>,
  ): Promise<UserWithoutPassword | null>;
}
