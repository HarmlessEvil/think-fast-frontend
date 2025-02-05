import { z } from 'zod';

export const packSchema = z.object({
  name: z.string(),
  rounds: z.array(z.object({
    name: z.string(),
    themes: z.array(z.object({
      name: z.string(),
      questions: z.array(z.object({
        points: z.number(),
        text: z.string(),
      })),
    })),
  })),
});

export const playerSchema = z.object({
  isReady: z.boolean(),
  profile: z.object({
    id: z.string(),
    username: z.string(),
  }),
  score: z.number(),
});
