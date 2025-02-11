import urlJoin from 'proper-url-join';
import { request } from '../../api/client';
import { GameSnapshot } from '../../api/types.ts';

export const getGame = async (lobbyID: string): Promise<GameSnapshot> =>
  request(urlJoin('/lobby', lobbyID, 'game'));

export const exitToLobby = async (lobbyID: string): Promise<void> =>
  request(urlJoin('/lobby', lobbyID, 'game', 'exit'), { method: 'POST' });
