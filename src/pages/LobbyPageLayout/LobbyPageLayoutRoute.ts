import { ActionFunction } from 'react-router-dom';
import { queryClient } from '../../api/client.ts';
import { meQueryOptions } from '../../components/auth/api.ts';
import { joinLobby } from '../../components/lobby/api.ts';
import { schema as joinLobbySchema } from '../../components/lobby/JoinLobbySchema.ts';

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
