import { v4 as uuidv4 } from 'uuid';
import bcript from 'bcrypt';
import { IUserRepository } from '../repositories/user.repository.interface.js';

interface IUserService {
  name: string;
  email: string;
  password: string;
}

class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async createUser({ name, email, password }: IUserService) {
    const hashPassword = await bcript.hash(password, 10);

    await this.userRepository.create({
      id: uuidv4(),
      name,
      email,
      password: hashPassword,
    });
  }

  async getAll() {
    const users = this.userRepository.read();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersJson = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    return usersJson;
  }
}

export default UserService;
