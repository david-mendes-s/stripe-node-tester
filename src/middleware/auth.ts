import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/auth.config.js';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../utils/errors/app-errors.js';

interface AuthRequest extends Request {
  user?: { id: string; username: string }; // Tipo para o usuário decodificado
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers['authorization'];

    // Verifica se o cabeçalho de autorização existe
    if (!authHeader) {
      throw new UnauthorizedError('Cabeçalho de autorização ausente');
    }

    // O token geralmente vem no formato "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token ausente');
    }

    if (!jwtSecret) {
      throw new Error('Segredo JWT não configurado');
    }

    // Verifica o token
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        throw new ForbiddenError('Token inválido ou expirado');
      }

      // Adiciona o usuário decodificado à requisição para uso posterior
      req.user = user as { id: string; username: string };
      next(); // Prossegue para a próxima função (rota)
    });
  } catch (err) {
    next(err);
  }
};
