import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z
    .string()
    .max(20, { message: 'A senha deve ter no máximo 20 caracteres.' }),
});

// O Zod infere o tipo com base no schema
export type TLoginSchema = z.infer<typeof loginSchema>;
