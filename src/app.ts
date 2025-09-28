import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import e from 'express';

export const app = express();

app.use(express.json());
app.use(cookieParser());

// Chamada para Rotas
app.use(router);

export default app;