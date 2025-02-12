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

export const playerProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const playerSchema = z.object({
  profile: playerProfileSchema,
  score: z.number(),
});

const stateQuestionDisplaySchema = z.object({
  questionIndex: z.number(),
  questionText: z.string(),
  themeIndex: z.number(),
});

const stateBuzzingInSchema = z.object({
  buzzedIn: z.record(z.date()),
  stateQuestionDisplay: stateQuestionDisplaySchema,
});

export const gameSnapshotSchema = z.object({
  currentPlayer: z.string(),
  host: z.string(),
  pack: packSchema,
  playedQuestions: z.array(z.object({
    questionIndex: z.number(),
    themeIndex: z.number(),
  })).nullable().transform((questions, ctx) => {
    if (!questions) {
      return null;
    }

    const set = new Set(questions);
    if (set.size !== questions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Array items must be unique',
      });

      return z.NEVER;
    }

    return set;
  }),
  players: z.record(playerSchema),
  roundIndex: z.number(),
  state: z.union([
    z.object({
      name: z.literal('question-selection'),
      state: z.object({}),
    }),

    z.object({
      name: z.literal('question-display'),
      state: stateQuestionDisplaySchema,
    }),

    z.object({
      name: z.literal('buzzing-in'),
      state: stateBuzzingInSchema,
    }),

    z.object({
      name: z.literal('answer-evaluation'),
      state: z.object({
        player: z.string(),
        stateBuzzingIn: stateBuzzingInSchema,
      }),
    }),

    z.object({
      name: z.literal('game-over'),
      state: z.object({}),
    }),
  ]),
});
