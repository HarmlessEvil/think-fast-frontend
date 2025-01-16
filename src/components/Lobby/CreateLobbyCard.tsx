import styles from './CreateLobbyCard.module.css';

export const CreateLobbyCard = () => (
  <form className={styles.card}>
    <h2>Create a lobby</h2>
    <p>Start a new game and invite your friends to join!</p>
    <button>Create Lobby</button>
  </form>
);
