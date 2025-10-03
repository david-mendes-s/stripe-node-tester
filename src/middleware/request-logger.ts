import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.config.js';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log da requisição
  logger.http(`${req.method} ${req.path}`);
  next();
};
