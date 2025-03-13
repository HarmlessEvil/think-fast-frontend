import { useState } from 'react';
import styles from './PlayerLobbyActions.module.css';

type Props = {
  isPlaying: boolean
  isReady: boolean
  onReadyChange: (isReady: boolean) => void
}

export const PlayerLobbyActions = (
  {
    isPlaying,
    isReady,
    onReadyChange,
  }: Props,
) => {
  const [meIsReady, setMeIsReady] = useState(isReady);

  const handleReadyChange = () => {
    setMeIsReady(current => {
      const next = !current;
      onReadyChange(next);

      return next;
    });
  };

  return (
    !isPlaying && (
      <button className={styles.button} type="button" onClick={handleReadyChange}>
        {meIsReady ? 'Unready' : 'Ready'}
      </button>
    )
  );
};
