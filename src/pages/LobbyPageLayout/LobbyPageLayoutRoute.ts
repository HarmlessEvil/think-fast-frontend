import { ActionFunction } from 'react-router-dom';
import { queryClient } from '../../api/client.ts';
import { meQueryOptions } from '../../components/Auth/api.ts';
import { joinLobby } from '../../components/Lobby/api.ts';
import { schema as joinLobbySchema } from '../../components/Lobby/JoinLobbySchema.ts';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const joinLobbyData = joinLobbySchema.parse(Object.fromEntries(formData));
  await joinLobby(joinLobbyData.lobbyID);

  return null;
};

export const loader = async () => {
  await queryClient.prefetchQuery(meQueryOptions);
  return null;
};
