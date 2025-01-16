import styles from './JoinLobbyCard.module.css';

export const JoinLobbyCard = () => (
  <form className={styles.card} action="/lobby/1">
    <h2>Join a lobby</h2>
    <p>Enter the code shared by the lobby host to join.</p>
    <input id="lobby_code" name="lobby_code" type="text" placeholder="Enter Lobby Code"/>
    <button>Join Lobby</button>
  </form>
);
