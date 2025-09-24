import { Request, Response } from 'express';
import { db } from '../db/db.js';
import UserService from '../services/user.service.js';

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Validação básica no Controller
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: 'Nome, email e senha são obrigatórios' });
      }

      if (db.filterUser(email)) {
        return res.sendStatus(409);
      }

      const user = await this.userService.createUser({ name, email, password });

      return res.status(201).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ error: errorMessage });
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
}

export default UserController;
