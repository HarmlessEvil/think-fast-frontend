import urlJoin from 'proper-url-join';
import { ActionFunction, redirect } from 'react-router-dom';
import { createLobby } from '../../components/Lobby/api.ts';

export const action: ActionFunction = async (): Promise<Response> => {
  const { LobbyID } = await createLobby();
  return redirect(urlJoin('lobby', LobbyID));
};
