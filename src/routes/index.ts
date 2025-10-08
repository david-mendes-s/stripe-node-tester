import { Router } from 'express';
import usersRouter from './users.router.js';
import loginRouter from './login.router.js';
import refreshRouter from './refresh.router.js';
<<<<<<< HEAD
import billingRouter from './billing.router.js';
=======
import paymentsRouter from './payments.router.js';
>>>>>>> versao-youtubeV.2

const router = Router();

router.use('/users', usersRouter);
router.use('/login', loginRouter);
router.use('/refresh', refreshRouter);
<<<<<<< HEAD
router.use('/billing', billingRouter);
=======
router.use('/payments', paymentsRouter);
>>>>>>> versao-youtubeV.2

export default router;
