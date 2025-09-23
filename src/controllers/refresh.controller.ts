import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/auth.config.js';

class RefreshController {
  static async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh Token não encontrado.' });
    }

    try {
      // Verifica a validade do Refresh Token
      const decoded = jwt.verify(refreshToken, jwtSecret) as { id: string };

      // Gera um novo Token de Acesso
      const newAccessToken = jwt.sign({ id: decoded.id }, jwtSecret, {
        expiresIn: '15m',
      });

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(403).json(error.message);
      }
      return res.status(403).json('Ocorreu um erro desconhecido.');
    }
  }
}

export default RefreshController;
