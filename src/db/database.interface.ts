import User from '../models/user.model';

export interface IDatabase {
  create(user: User): void;
  read(): User[];
  filterUser(email: string): User | null;
}
