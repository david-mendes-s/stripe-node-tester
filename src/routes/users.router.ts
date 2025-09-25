// src/routes/usersRouter.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

import { prisma } from '../db/db.postgresql.js';
import { userSchema } from '../validations/user.validation.js';
import { validate } from '../middleware/validations.js';

import UserController from '../controllers/user.controller.js';
import UserService from '../services/user.service.js';
import UserRepository from '../repositories/user.repositoy.js';

const usersRouter = Router();

// Injeta o Prisma no repositório
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Use a arrow function para manter o contexto "this"
usersRouter.get('/', authenticateToken, (req, res) =>
  userController.getUsers(req, res),
);
usersRouter.post('/', validate(userSchema), (req, res) =>
  userController.createUser(req, res),
);

usersRouter.put('/', authenticateToken, (req, res) =>
  userController.updateUser(req, res),
);

export default usersRouter;
