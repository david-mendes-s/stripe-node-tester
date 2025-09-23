import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import UserController from '../controllers/user.controller.js';
const usersRouter = Router();
usersRouter.get('/', authenticateToken, UserController.getUsers);
usersRouter.post('/', UserController.createUser);
export default usersRouter;
