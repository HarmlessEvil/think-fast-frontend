import styles from './PlayerList.module.css';

type Player = {
  ID: string;
  Username: string
  IsReady: boolean
}

type Props = {
  players: Player[]
}

export const PlayerList = ({ players }: Props) =>
  players && (
    <ul className={styles.playerList}>
      {players.map(player => <PlayerListItem key={player.ID} player={player}/>)}
    </ul>
  );

const PlayerListItem = ({ player }: { player: Player }) => (
  <li>
    <span>{player.Username}</span>
    <span>{!player.IsReady && 'Not'} Ready</span>
  </li>
);
