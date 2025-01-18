import urlJoin from 'proper-url-join';
import { Outlet, useParams } from 'react-router-dom';
import { WebsocketProvider } from '../../api/WebsocketProvider.tsx';

export const LobbyPageLayout = () => {
  const { lobby: lobbyID } = useParams<'lobby'>();

  return (
    <WebsocketProvider url={urlJoin('/ws', 'lobby', lobbyID)}>
      <Outlet/>
    </WebsocketProvider>
  );
};
