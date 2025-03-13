import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import { meQueryOptions } from '../../components/auth/api.ts';
import { HostLobbyActions } from '../../components/lobby/HostLobbyActions.tsx';
import { PlayerList } from '../../components/lobby/PlayerList.tsx';
import { PlayerLobbyActions } from '../../components/lobby/PlayerLobbyActions.tsx';
import { loader } from './LobbyPageRoute.ts';
import styles from './LobbyPage.module.css';
import { PlayerID, PlayerProfile } from '../../api/types.ts';

type Lobby = Awaited<ReturnType<typeof loader>>

const addPlayer = (profile: PlayerProfile) =>
  (players: Lobby['players']) => ({
    ...players,
    [profile.id]: {
      isPlaying: false,
      isReady: false,
      profile: profile,
    },
  });

const setPlayersNotPlaying = (returnedPlayers: PlayerID[]) =>
  (players: Lobby['players']) => {
    const nextPlayers = { ...players };
    for (const player of returnedPlayers) {
      nextPlayers[player].isPlaying = false;
    }

    return nextPlayers;
  };

const removePlayer = (playerID: PlayerID) =>
  ({ [playerID]: _, ...rest }: Lobby['players']) => rest;

const setPlayerReady = (playerID: PlayerID) =>
  (players: Lobby['players']) =>
    ({ ...players, [playerID]: { ...players[playerID], isReady: true } });

const setPlayerUnready = (playerID: PlayerID) =>
  (players: Lobby['players']) =>
    ({ ...players, [playerID]: { ...players[playerID], isReady: false } });

export const LobbyPage = () => {
  const navigate = useNavigate();

  const { lobby: lobbyID } = useParams<'lobby'>();
  const lobby = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const { data: meQueryData } = useQuery(meQueryOptions);
  const me = meQueryData!;

  const [players, setPlayers] = useState(lobby.players);

  const myPlayer = players[me.id];
  const playerList = Object.values(players).sort(
    (a, b) =>
      a.profile.username.localeCompare(b.profile.username),
  );

  const websocketManager = useContext(WebsocketContext);

  const isHost = lobby.host == me.id;

  useEffect(() => {
    if (!websocketManager) {
      return;
    }

    websocketManager.on('game-started', () => {
      navigate('game');
    });

    websocketManager.on('player-joined', (event) => {
      setPlayers(addPlayer(event.player));
    });

    websocketManager.on('player-left', (event) => {
      setPlayers(removePlayer(event.playerID));
    });

    websocketManager.on('player-readied', (event) => {
      setPlayers(setPlayerReady(event.playerID));
    });

    websocketManager.on('player-unreadied', (event) => {
      setPlayers(setPlayerUnready(event.playerID));
    });

    websocketManager.on('players-returned-to-lobby', (event) => {
      setPlayers(setPlayersNotPlaying(event.players));
    });

    websocketManager.onClose((closedByClient, event) => {
      if (!closedByClient && event.wasClean) {
        navigate('/');
      }
    });

    return () => {
      websocketManager.off('player-joined');
      websocketManager.off('player-left');
      websocketManager.off('player-readied');
      websocketManager.off('player-unreadied');
      websocketManager.off('players-returned-to-lobby');

      websocketManager.offClose();
    };
  }, [navigate, websocketManager]);

  const onReadyChange = (isReady: boolean) => {
    if (!websocketManager) {
      return;
    }

    websocketManager.send(
      isReady
        ? { type: 'ready', data: null }
        : { type: 'unready', data: null },
    );
  };

  return (
    <>
      <header className={styles.header}>
        <h1>Lobby: Think Fast!</h1>
        <p>Code: {lobbyID}</p>
      </header>

      <main className={styles.main}>
        <PlayerList me={me.id} players={playerList}/>
      </main>

      {
        isHost
          ? <HostLobbyActions/>
          : websocketManager && (
          <PlayerLobbyActions isPlaying={myPlayer.isPlaying} isReady={myPlayer.isReady} onReadyChange={onReadyChange}/>
        )
      }
    </>
  );
};
