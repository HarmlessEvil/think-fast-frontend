import { ActionFunction, Params } from 'react-router-dom';
import { getLobby, joinLobby } from '../../components/Lobby/api.ts';
import { schema as joinLobbySchema } from '../../components/Lobby/JoinLobbySchema.ts';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const joinLobbyData = joinLobbySchema.parse(Object.fromEntries(formData));
  await joinLobby(joinLobbyData.lobbyID);

  return null;
};

export const loader = async ({ params }: { params: Params<'lobby'> }) => {
  return getLobby(params.lobby!);
};
