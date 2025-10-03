import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';

export const app = express();

app.use(express.json());
app.use(cookieParser());

// Middleware de log para todas as requisições
app.use(requestLogger);

// Chamada para Rotas
app.use(router);

// Middleware de tratamento de erros (deve ser registrado após as rotas)
app.use(errorHandler);

export default app;
