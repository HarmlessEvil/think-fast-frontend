import styles from './PlayerList.module.css';
import { PlayerID } from '../../api/types.ts';

type Profile = {
  id: string
  username: string
}

type Player = {
  isPlaying: boolean
  isReady: boolean
  profile: Profile
}

type Props = {
  me: PlayerID
  players: Player[]
}

export const PlayerList = ({ me, players }: Props) =>
  players.length != 0 && (
    <ul className={styles.playerList}>
      {players.map(player => <PlayerListItem key={player.profile.id} me={me} player={player}/>)}
    </ul>
  );

const PlayerListItem = (
  { me, player }: {
    me: PlayerID
    player: Player
  },
) => (
  <li>
    <span>{player.profile.username} {player.profile.id === me && '(You)'}</span>
    <span>{!player.isReady && 'Not'} Ready {player.isPlaying && '(Playing)'}</span>
  </li>
);
