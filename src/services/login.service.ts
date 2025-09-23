import jwt from 'jsonwebtoken';
import bcript from 'bcrypt';
import { jwtSecret } from '../config/auth.config.js';
import { db } from '../db/db.js';

interface ILogin {
  email: string;
  password: string;
}

class LoginService {
  static async login({ email, password }: ILogin) {
    const user = await db.filterUser(email);

    if (!user) {
      throw new Error('User not found');
    }

    const match = await bcript.compare(password, user.password);

    if (!match) {
      throw new Error('Invalid password');
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
