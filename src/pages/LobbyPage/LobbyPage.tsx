import urlJoin from 'proper-url-join';
import { useContext, useEffect, useState } from 'react';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import { PlayerList } from '../../components/Lobby/PlayerList.tsx';
import { loader } from '../LobbyPageLayout/LobbyPageLayoutRoute.ts';
import styles from './LobbyPage.module.css';

type Lobby = Awaited<ReturnType<typeof loader>>

const addPlayer = (player: Lobby['players'][number]) => {
  return (players: Lobby['players']) => [...(players ?? []), player];
};

const removePlayer = (playerID: string) =>
  (players: Lobby['players']) => {
    return players.filter(player => player.id != playerID);
  };

const setPlayerReady = (playerID: string) =>
  (players: Lobby['players']) => {
    return players.map((player) => {
      return player.id === playerID ? { ...player, isReady: true } : player;
    });
  };

const setPlayerUnready = (playerID: string) =>
  (players: Lobby['players']) => {
    return players.map((player) => {
      return player.id === playerID ? { ...player, isReady: false } : player;
    });
  };

export const LobbyPage = () => {
  const { lobby: lobbyID } = useParams<'lobby'>();
  const lobby = useRouteLoaderData('lobby-layout') as Awaited<ReturnType<typeof loader>>;

  const [players, setPlayers] = useState(lobby.players);

  const websocketManager = useContext(WebsocketContext);

  useEffect(() => {
    if (!websocketManager) {
      return;
    }

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
  }, [websocketManager]);

  return (
    <>
      <header className={styles.header}>
        <h1>Lobby: Think Fast!</h1>
        <p>Code: {lobbyID}</p>
      </header>

      <main className={styles.main}>
        <PlayerList players={players}/>
      </main>

      <form action={urlJoin(lobbyID, 'game', { leadingSlash: false })} className={styles.footer}>
        <button type="button" onClick={() => {
          websocketManager?.send({ type: 'ready', data: null });
        }}>Ready
        </button>
        <button type="submit">Start Game</button>
      </form>
    </>
  );
};
