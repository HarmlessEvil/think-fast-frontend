import urlJoin from 'proper-url-join';
import { request } from '../../api/client.ts';

export const createLobby = (): Promise<{
  LobbyID: string
}> => request('lobby', { method: 'POST' });

export const getLobby = (id: string): Promise<{
  Players: {
    ID: string;
    IsReady: boolean;
    Username: string;
  }[];
}> => request(urlJoin('lobby', id));

export const joinLobby = async (id: string): Promise<Record<never, never>> =>
  request(urlJoin('lobby', id, 'join'), { method: 'POST' });
