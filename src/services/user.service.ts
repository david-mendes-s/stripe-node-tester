import { db } from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcript from 'bcrypt';

interface IUserService {
  name: string;
  email: string;
  password: string;
}

class UserService {
  static async createUser({ name, email, password }: IUserService) {
    const hashPassword = await bcript.hash(password, 10);

    await db.create({ id: uuidv4(), name, email, password: hashPassword });
  }

  static async getAll() {
    const users = db.read();

    const usersJson = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    return usersJson;
  }
}

export default UserService;
