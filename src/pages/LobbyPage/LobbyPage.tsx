import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import { meQueryOptions } from '../../components/Auth/api.ts';
import { HostLobbyActions } from '../../components/Lobby/HostLobbyActions.tsx';
import { PlayerList } from '../../components/Lobby/PlayerList.tsx';
import { PlayerLobbyActions } from '../../components/Lobby/PlayerLobbyActions.tsx';
import { loader } from '../LobbyPageLayout/LobbyPageLayoutRoute.ts';
import styles from './LobbyPage.module.css';

type Lobby = Awaited<ReturnType<typeof loader>>

const addPlayer = (player: Lobby['players'][string]) =>
  (players: Lobby['players']) => ({ ...players, [player.profile.id]: player });

const removePlayer = (playerID: string) =>
  ({ [playerID]: _, ...rest }: Lobby['players']) => rest;

const setPlayerReady = (playerID: string) =>
  (players: Lobby['players']) =>
    ({ ...players, [playerID]: { ...players[playerID], isReady: true } });

const setPlayerUnready = (playerID: string) =>
  (players: Lobby['players']) =>
    ({ ...players, [playerID]: { ...players[playerID], isReady: false } });

export const LobbyPage = () => {
  const navigate = useNavigate();

  const { lobby: lobbyID } = useParams<'lobby'>();
  const lobby = useRouteLoaderData('lobby-layout') as Awaited<ReturnType<typeof loader>>;

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

    return () => {
      websocketManager.off('player-joined');
      websocketManager.off('player-left');
      websocketManager.off('player-readied');
      websocketManager.off('player-unreadied');
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
        <PlayerList me={me} players={playerList}/>
      </main>

      {
        isHost
          ? <HostLobbyActions/>
          : websocketManager && <PlayerLobbyActions isReady={myPlayer.isReady} onReadyChange={onReadyChange}/>
      }
    </>
  );
};
