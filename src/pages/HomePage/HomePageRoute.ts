import urlJoin from 'proper-url-join';
import { ActionFunction, redirect } from 'react-router-dom';
import { createLobby } from '../../components/lobby/api.ts';

export const action: ActionFunction = async (): Promise<Response> => {
  const { lobbyID } = await createLobby();
  return redirect(urlJoin('lobby', lobbyID));
};
