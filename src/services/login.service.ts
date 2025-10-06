import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtSecret } from '../config/auth.config.js';
import { IUserRepository } from '../repositories/users/user.repository.interface.js';
import { UnauthorizedError } from '../utils/errors/app-errors.js';

interface ILogin {
  email: string;
  password: string;
}

class LoginService {
  constructor(private userRepository: IUserRepository) {}

  async login({ email, password }: ILogin) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Email ou senha inválidos.');
    }

    // Gera o Token de Acesso (curta duração)
    const accessToken = jwt.sign(
      { id: user.id, username: user.name },
      jwtSecret,
      { expiresIn: '15m' }, // Exemplo: 15 minutos
    );

    // Gera o Refresh Token (longa duração)
    const refreshToken = jwt.sign(
      { id: user.id }, // O Refresh Token geralmente contém menos informações
      jwtSecret,
      { expiresIn: '1d' }, // Exemplo: 7 dias
    );

    return { accessToken, refreshToken };
  }
}

export default LoginService;
