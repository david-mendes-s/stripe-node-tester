import { Router } from 'express';
import usersRouter from './users.router';
import loginRouter from './login.router';
import refreshRouter from './refresh.router';

const router = Router();

router.use('/users', usersRouter);
router.use('/login', loginRouter);
router.use('/refresh', refreshRouter);

export default router;
