import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

// O Zod infere o tipo com base no schema
export type TLoginSchema = z.infer<typeof loginSchema>;
