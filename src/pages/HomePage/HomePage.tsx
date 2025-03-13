import { CreateLobbyCard } from '../../components/lobby/CreateLobbyCard.tsx';
import { JoinLobbyCard } from '../../components/lobby/JoinLobbyCard.tsx';
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

