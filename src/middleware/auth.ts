import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/auth.config.js';

interface AuthRequest extends Request {
  user?: { id: string; username: string }; // Tipo para o usuário decodificado
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  // Verifica se o cabeçalho de autorização existe
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: 'Cabeçalho de autorização ausente' });
  }

  // O token geralmente vem no formato "Bearer TOKEN"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Segredo JWT não configurado' });
  }

  // Verifica o token
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }

    // Adiciona o usuário decodificado à requisição para uso posterior
    req.user = user as { id: string; username: string };
    next(); // Prossegue para a próxima função (rota)
  });
};
