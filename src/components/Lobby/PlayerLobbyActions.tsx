import { useState } from 'react';
import styles from './PlayerLobbyActions.module.css';

type Props = {
  isReady: boolean
  onReadyChange: (isReady: boolean) => void
}

export const PlayerLobbyActions = (
  {
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
    <button className={styles.button} type="button" onClick={handleReadyChange}>
      {meIsReady ? 'Unready' : 'Ready'}
    </button>
  );
};
