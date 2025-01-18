import urlJoin from 'proper-url-join';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { PlayerList } from '../../components/Lobby/PlayerList.tsx';
import { loader } from '../LobbyPageLayout/LobbyPageLayoutRoute.ts';
import styles from './LobbyPage.module.css';

export const LobbyPage = () => {
  const { lobby: lobbyID } = useParams<'lobby'>();
  const lobby = useRouteLoaderData('lobby-layout') as Awaited<ReturnType<typeof loader>>;

  return (
    <>
      <header className={styles.header}>
        <h1>Lobby: Think Fast!</h1>
        <p>Code: {lobbyID}</p>
      </header>

      <main className={styles.main}>
        <PlayerList players={lobby.Players}/>
      </main>

      <form action={urlJoin(lobbyID, 'game', { leadingSlash: false })} className={styles.footer}>
        <button type="button">Ready</button>
        <button type="submit">Start Game</button>
      </form>
    </>
  );
};
