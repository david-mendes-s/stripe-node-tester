import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import webHookRouter from './routes/webhooks.router.js';

export const app = express();

app.use('/webhook', webHookRouter);

app.use(express.json());
app.use(cookieParser());

// Middleware de log para todas as requisições
app.use(requestLogger);

// Chamada para Rotas
app.use(router);

// Middleware de tratamento de erros (deve ser registrado após as rotas)
app.use(errorHandler);

export default app;
