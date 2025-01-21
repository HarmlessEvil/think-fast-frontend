import urlJoin from 'proper-url-join';
import styles from './HostLobbyActions.module.css';

type Props = {
  lobbyID: string
}

export const HostLobbyActions = ({ lobbyID }: Props) => (
  <form action={urlJoin(lobbyID, 'game', { leadingSlash: false })} className={styles.form}>
    <button type="submit">Start Game</button>
  </form>
);
