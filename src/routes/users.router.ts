import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import UserController from '../controllers/user.controller';

const usersRouter = Router();

usersRouter.get('/', authenticateToken, UserController.getUsers);

usersRouter.post('/', UserController.createUser);

export default usersRouter;
