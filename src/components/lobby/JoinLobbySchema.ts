import { z } from 'zod';

export const schema = z.object({
  lobbyID: z.string().length(32),
});
