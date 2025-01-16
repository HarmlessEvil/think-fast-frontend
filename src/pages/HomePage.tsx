import { CreateLobbyCard } from '../components/Lobby/CreateLobbyCard.tsx';
import { JoinLobbyCard } from '../components/Lobby/JoinLobbyCard.tsx';
import styles from './HomePage.module.css';

export const HomePage = () => (
  <>
    <header className={styles.header}>
      <h1>Think Fast! Lobby</h1>
      <p>Join the fun or start your own game!</p>
    </header>

    <main className={styles.main}>
      <CreateLobbyCard/>
      <JoinLobbyCard/>
    </main>
  </>
);
