import { Router, raw } from 'express';

import WebhookController from '../controllers/webhook.stripe.controller.js';
const webHookRouter = Router();

const webhookController = new WebhookController();

// Chama o método da instância do controlador com a arrow function
webHookRouter.post('/', raw({ type: 'application/json' }), (req, res) =>
  webhookController.webhook(req, res),
);

export default webHookRouter;
