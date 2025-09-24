import User from '../models/user.model.js';
import { IUserRepository } from './user.repository.interface.js';

class UserRepository implements IUserRepository {
  private db: IUserRepository;

  constructor(db: IUserRepository) {
    this.db = db;
  }

  create(user: User): void {
    this.db.create(user);
  }

  read(): User[] {
    return this.db.read();
  }

  filterUser(email: string): User | null {
    return this.db.filterUser(email);
  }
}

export default UserRepository;
