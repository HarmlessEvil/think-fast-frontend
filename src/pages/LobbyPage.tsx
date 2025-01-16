import { PlayerList } from '../components/Lobby/PlayerList.tsx';
import styles from './LobbyPage.module.css';

const players = [
  {
    nickname: 'Player1 (You)',
    ready: true,
  },
  {
    nickname: 'Player2',
    ready: false,
  },
  {
    nickname: 'Player3',
    ready: true,
  },
];

export const LobbyPage = () => (
  <form>
    <header className={styles.header}>
      <h1>Lobby: Think Fast!</h1>
      <p>Code: 123456</p>
    </header>

    <main className={styles.main}>
      <PlayerList players={players}/>
    </main>

    <form action="/game/1" className={styles.footer}>
      <button type="button">Ready</button>
      <button type="submit">Start Game</button>
    </form>
  </form>
);
