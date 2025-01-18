import styles from './PlayerList.module.css';

type Player = {
  id: string;
  username: string
  isReady: boolean
}

type Props = {
  players: Player[]
}

export const PlayerList = ({ players }: Props) =>
  players && (
    <ul className={styles.playerList}>
      {players.map(player => <PlayerListItem key={player.id} player={player}/>)}
    </ul>
  );

const PlayerListItem = ({ player }: { player: Player }) => (
  <li>
    <span>{player.username}</span>
    <span>{!player.isReady && 'Not'} Ready</span>
  </li>
);
