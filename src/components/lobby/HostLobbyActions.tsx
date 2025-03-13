import { Form } from 'react-router-dom';
import styles from './HostLobbyActions.module.css';

export const HostLobbyActions = () => (
  <Form method="post" className={styles.form}>
    <button type="submit">Start Game</button>
  </Form>
);
