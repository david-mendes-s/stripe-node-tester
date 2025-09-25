// src/validations/user.validation.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

// O Zod infere o tipo com base no schema
export type TUserSchema = z.infer<typeof userSchema>;
