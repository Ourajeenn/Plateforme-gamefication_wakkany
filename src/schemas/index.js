import { z } from 'zod';

export const playerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z.string().email('Adresse email invalide'),
  age: z.number().min(3).max(120).optional(),
});

export const quizConfigSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().min(10).max(300),
  numberOfQuestions: z.number().min(1).max(50),
});
export const authSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
});
