import styles from './PlayerList.module.css';

type Profile = {
  id: string
  username: string
}

type Player = {
  isReady: boolean
  profile: Profile
}

type Props = {
  me: Profile
  players: Player[]
}

export const PlayerList = ({ me, players }: Props) =>
  players && (
    <ul className={styles.playerList}>
      {players.map(player => <PlayerListItem key={player.profile.id} me={me} player={player}/>)}
    </ul>
  );

const PlayerListItem = ({ me, player }: { me: Profile; player: Player }) => (
  <li>
    <span>{player.profile.username} {player.profile.id === me.id && '(You)'}</span>
    <span>{!player.isReady && 'Not'} Ready</span>
  </li>
);
