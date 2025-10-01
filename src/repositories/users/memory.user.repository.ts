import User, { UserWithoutPassword } from '../../models/user.model.js';
import { IUserRepository } from './user.repository.interface.js';

export class InMemoryDatabase implements IUserRepository {
  private static instance: InMemoryDatabase | null = null;
  private data: User[] = [];

  private constructor() {
    // Evita instanciação direta
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
      console.log('Banco de dados em memória (array) criado.');
    }
    return InMemoryDatabase.instance;
  }

  public async create(user: User): Promise<User> {
    await this.data.push(user);
    return this.data[this.data.length - 1];
  }

  public async readAll(): Promise<UserWithoutPassword[]> {
    return await this.data;
  }

  async update(
    id: string,
    userData: Partial<Omit<User, 'id'>>,
  ): Promise<UserWithoutPassword | null> {
    const user = this.data.find((u) => u.id === id);
    if (!user) {
      return null;
    }
    Object.assign(user, userData);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.data.find((u) => u.email === email);
    return Promise.resolve(user || null);
  }

  clear(): void {
    this.data = [];
  }
}

export const db = InMemoryDatabase.getInstance();
