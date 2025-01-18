import urlJoin from 'proper-url-join';
import { ActionFunction, redirect } from 'react-router-dom';
import { createLobby, joinLobby } from '../../components/Lobby/api.ts';
import { schema as joinLobbySchema } from '../../components/Lobby/JoinLobbySchema.ts';

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "create-lobby": {
      const { LobbyID } = await createLobby();
      return redirect(urlJoin('lobby', LobbyID));
    }
    case "join-lobby": {
      const joinLobbyData = joinLobbySchema.parse(Object.fromEntries(formData));
      await joinLobby(joinLobbyData.lobbyID);

      return redirect(urlJoin('lobby', joinLobbyData.lobbyID));
    }
    default:
      throw new Error("Invalid request");
  }
};
