import { Router, raw } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../controllers/user.controller.js';

import WebhookController from '../controllers/webhook.stripe.controller.js';
const webHookRouter = Router();

const webhookController = new WebhookController();

// Chama o método da instância do controlador com a arrow function
webHookRouter.post(
  '/',
  raw({ type: 'application/json' }),
  authenticateToken,
  (req, res) => webhookController.webhook(req as AuthRequest, res),
);

export default webHookRouter;
