import User from '../models/user.model.js';

export interface IUserRepository {
  create(user: User): void;
  read(): User[];
  filterUser(email: string): User | null;
}
