import { Router } from 'express';
import { prisma } from '../db/db.postgresql.js'; // Importa a instância do Prisma
import UserRepository from '../repositories/users/prisma.user.repositoy.js';
import LoginService from '../services/login.service.js';
import LoginController from '../controllers/login.controller.js';

import { loginSchema } from '../validations/login.validation.js';
import { validate } from '../middleware/validations.js';

const loginRouter = Router();

// Instancia as classes para injeção de dependência
const userRepository = new UserRepository(prisma);
const loginService = new LoginService(userRepository);
const loginController = new LoginController(loginService);

// Chama o método da instância do controlador com a arrow function
loginRouter.post('/', validate(loginSchema), (req, res) =>
  loginController.createLogin(req, res),
);

export default loginRouter;
