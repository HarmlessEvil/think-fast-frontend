import { useState } from 'react';
import { WebsocketManager } from '../../api/websocket.ts';
import styles from './PlayerLobbyActions.module.css';

type Props = {
  websocketManager: WebsocketManager;
}

export const PlayerLobbyActions = ({ websocketManager }: Props) => {
  const [isReady, setIsReady] = useState(false);

  return (
    <button className={styles.button} type="button" onClick={() => {
      websocketManager.send(
        isReady
          ? { type: 'unready', data: null }
          : { type: 'ready', data: null },
      );

      setIsReady(!isReady);
    }}>
      {isReady ? 'Unready' : 'Ready'}
    </button>
  );
};
