import { Form } from 'react-router-dom';
import styles from './CreateLobbyCard.module.css';

export const CreateLobbyCard = () => (
  <Form className={styles.card} method="post">
    <h2>Create a lobby</h2>
    <p>Start a new game and invite your friends to join!</p>
    <button name="intent" value="create-lobby">Create Lobby</button>
  </Form>
);
