import { z } from 'zod';

export const questionContentItemSchema = z.object({
  text: z.string(),
  type: z.string(),
});

export const packSchema = z.object({
  name: z.string(),
  rounds: z.array(z.object({
    name: z.string(),
    themes: z.array(z.object({
      name: z.string(),
      questions: z.array(z.object({
        content: z.array(questionContentItemSchema).nullish().transform(c => c ?? []),
        points: z.number(),
        rightAnswer: z.string().nullish(),
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
  buzzInAt: z.coerce.date(),
  questionContent: z.array(questionContentItemSchema).nullish().transform(c => c ?? []),
  questionIndex: z.number(),
  themeIndex: z.number(),
});

const stateBuzzingInSchema = z.object({
  buzzedIn: z.record(z.coerce.date()),
  stateQuestionDisplay: stateQuestionDisplaySchema,
  timeoutAt: z.coerce.date(),
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

    const set = new Set(questions.map(q => `${q.themeIndex}:${q.questionIndex}`));
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
