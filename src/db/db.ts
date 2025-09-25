import User from '../models/user.model.js';

export class InMemoryDatabase {
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

  public create(user: User): void {
    this.data.push(user);
  }

  public read(): User[] {
    return this.data;
  }

  public filterUser(email: string): User | null {
    const user = this.data.find((u) => u.email === email);
    return user ? user : null;
  }
}

export const db = InMemoryDatabase.getInstance();
