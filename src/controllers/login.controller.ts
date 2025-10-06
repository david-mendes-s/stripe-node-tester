import { Request, Response } from 'express';
import { ILoginService } from '../services/login.service.interface.js';

class LoginController {
  // eslint-disable-next-line prettier/prettier
  constructor(private loginService: ILoginService) {}

  async createLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const { accessToken, refreshToken } = await this.loginService.login({
        email,
        password,
      });

      // Armazena o Refresh Token em um cookie seguro
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Impede o acesso via JavaScript do lado do cliente
        secure: process.env.NODE_ENV === 'production', // Use 'secure' em produção
        sameSite: 'strict',
      });

      return res.status(200).json({ accessToken });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(400).json({ message: errorMessage });
    }
  }
}

export default LoginController;
