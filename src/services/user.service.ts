import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { IUserRepository } from '../repositories/users/user.repository.interface.js';
import { IUserService } from './user.service.interface.js';
import User from '../models/user.model.js';
import { createStripeCustomer } from '../utils/stripe.js';

class UserService implements IUserService {
  // eslint-disable-next-line prettier/prettier
  constructor(private userRepository: IUserRepository) {}

  async createUser({ name, email, password }: Omit<User, 'id'>) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Usuário com este email já existe.');
    }

    const id = uuidv4();
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id,
      name,
      email,
      password: hashPassword,
    };

    const customer = await createStripeCustomer({ name, email });

    await this.userRepository.create({
      ...newUser,
      stripeCustomerId: customer.id,
    });

    return newUser;
  }

  async getAll() {
    const users = await this.userRepository.readAll();

    return users;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id'>>) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, userData);

    if (!updatedUser) {
      throw new Error('Usuário não encontrado ou sem permissão');
    }

    return updatedUser;
  }
}

export default UserService;
