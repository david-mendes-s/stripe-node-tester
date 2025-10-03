// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/app-errors.js';
import { ZodError } from 'zod';
import logger from '../config/logger.config.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  // Log do erro com Winston em vez de console.error
  logger.error(`${req.method} ${req.path} - ${err.message}`);

  // Para erros mais graves, você pode incluir o stack trace
  if (!(err instanceof ZodError) && !(err instanceof AppError)) {
    logger.error(err.stack);
  }

  // Erros de validação do Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: err.message,
    });
  }

  // Erros da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Erros não tratados
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
};
