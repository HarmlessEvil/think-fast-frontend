import styles from './PlayerList.module.css';

type Player = {
  nickname: string
  ready: boolean
}

type Props = {
  players: Player[]
}

export const PlayerList = ({ players }: Props) => (
  <ul className={styles.playerList}>
    {players.map(player => <PlayerListItem key={player.nickname} player={player}/>)}
  </ul>
);

const PlayerListItem = ({ player }: { player: Player }) => (
  <li>
    <span>{player.nickname}</span>
    <span>{!player.ready && 'Not'} Ready</span>
  </li>
);
