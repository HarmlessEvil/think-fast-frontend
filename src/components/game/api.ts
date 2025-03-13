import urlJoin from 'proper-url-join';
import { request } from '../../api/client';
import { GameSnapshot } from '../../api/types.ts';
import { gameSnapshotSchema } from '../../api/schemas.ts';

export const getGame = async (lobbyID: string): Promise<GameSnapshot> =>
  gameSnapshotSchema.parse(await request(urlJoin('/lobby', lobbyID, 'game')));

export const exitToLobby = async (lobbyID: string): Promise<void> =>
  request(urlJoin('/lobby', lobbyID, 'game', 'exit'), { method: 'POST' });
