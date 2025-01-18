import { useLoaderData, useParams } from 'react-router-dom';
import { PlayerList } from '../../components/Lobby/PlayerList.tsx';
import styles from './LobbyPage.module.css';
import { loader } from './LobbyPageRoute.ts';

export const LobbyPage = () => {
  const { lobby: lobbyID } = useParams<'lobby'>();
  const lobby = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <>
      <header className={styles.header}>
        <h1>Lobby: Think Fast!</h1>
        <p>Code: {lobbyID}</p>
      </header>

      <main className={styles.main}>
        <PlayerList players={lobby.Players}/>
      </main>

      <form action="/game/1" className={styles.footer}>
        <button type="button">Ready</button>
        <button type="submit">Start Game</button>
      </form>
    </>
  );
};
