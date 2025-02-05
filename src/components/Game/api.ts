import urlJoin from 'proper-url-join';
import { request } from '../../api/client';
import { z } from 'zod';
import { packSchema, playerSchema } from '../../api/schemas.ts';

export const getGame = async (lobbyID: string): Promise<{
  currentPlayer: string
  pack: z.infer<typeof packSchema>
  players: z.infer<typeof playerSchema>[]
  round: number
}> => request(urlJoin('/lobby', lobbyID, 'game'));
