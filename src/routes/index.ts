import { Router } from 'express';
import usersRouter from './users.router.js';
import loginRouter from './login.router.js';
import refreshRouter from './refresh.router.js';
import paymentsRouter from './payments.router.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/login', loginRouter);
router.use('/refresh', refreshRouter);
router.use('/payments', paymentsRouter);

export default router;
