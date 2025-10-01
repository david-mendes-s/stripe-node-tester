// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { IUserService } from '../services/user.service.interface.js'; // Use a interface do serviço

export interface AuthRequest extends Request {
  user: {
    id: string;
    username: string;
  };
}

class UserController {
  // eslint-disable-next-line prettier/prettier
  constructor(private userService: IUserService) { }

  createUser = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Validação básica de requisição (pode ser movida para um middleware)
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: 'Nome, email e senha são obrigatórios.' });
      }

      // Chama o serviço, que é responsável por toda a lógica de negócio
      const user = await this.userService.createUser({ name, email, password });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      // Erros de validação do serviço devem ter o status adequado (ex: 409 Conflict)
      const statusCode =
        error instanceof Error && error.message.includes('existe') ? 409 : 500;
      return res.status(statusCode).json({ error: errorMessage });
    }
  };

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAll();
      return res.status(200).json(users);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ error: errorMessage });
    }
  };

  updateUser = async (req: AuthRequest, res: Response) => {
    try {
      const id = req.user.id;

      // Supondo que o ID do usuário autenticado esteja disponível em req.userId
      const userData = req.body;

      if (!id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }
      const updatedUser = await this.userService.updateUser(id, userData);

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.status(200).json(updatedUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      const statusCode =
        error instanceof Error && error.message.includes('permissão')
          ? 403
          : 500;
      return res.status(statusCode).json({ error: errorMessage });
    }
  };
}
export default UserController;
