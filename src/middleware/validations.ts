import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validate =
  (schema: z.ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Erro de validação.',
          details: error.issues.map((issue) => issue.message),
        });
      }
      next(error); // Passa o erro para o próximo middleware
    }
  };
