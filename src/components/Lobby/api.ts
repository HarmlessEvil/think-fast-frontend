import urlJoin from 'proper-url-join';
import { request } from '../../api/client.ts';

export const createLobby = (): Promise<{
  lobbyID: string
}> => request('/lobby', { method: 'POST' });

export const getLobby = (id: string): Promise<{
  host: string
  players: {
    isReady: boolean
    profile: {
      id: string
      username: string
    }
  }[]
}> => request(urlJoin('/lobby', id));

export const joinLobby = async (id: string): Promise<Record<never, never>> =>
  request(urlJoin('/lobby', id, 'join'), { method: 'PUT' });

export const startGame = async (lobbyID: string): Promise<Record<never, never>> =>
  request(urlJoin('/lobby', lobbyID, 'start-game'), { method: 'POST' });
