import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

import { db } from '../db/db.js'; // Garantir que o banco de dados seja inicializado

import UserController from '../controllers/user.controller.js';
import UserService from '../services/user.service.js';
import UserRepository from '../repositories/user.repositoy.js';

const usersRouter = Router();

// injeta o db no repository
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

usersRouter.get('/', authenticateToken, userController.getUsers);

usersRouter.post('/', userController.createUser);

export default usersRouter;
