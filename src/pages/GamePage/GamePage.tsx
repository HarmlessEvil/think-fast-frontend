import { useContext, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import { CategoryHeader } from '../../components/Game/CategoryHeader.tsx';
import { QuestionValue } from '../../components/Game/QuestionValue.tsx';
import styles from './GamePage.module.css';
import { loader } from './GamePageRoute.ts';

export const GamePage = () => {
  const game = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const websocketManager = useContext(WebsocketContext);

  useEffect(() => {
    if (!websocketManager) {
      return;
    }

    return () => {

    };
  }, [websocketManager]);

  return (
    <>
      <header className={styles.header}>
        <h1>"{game.pack.name}" Pack</h1>
        <p>Round {game.round + 1}</p>
        <div className={styles.score}>
          {game.players.map((player) => (
            <span key={player.profile.id}>{player.profile.username}: {player.score}</span>
          ))}
        </div>
      </header>

      <form className={styles.main}>
        {game.pack.rounds[game.round].themes.map((theme) => (
          <CategoryHeader key={theme.name} name={theme.name}/>
        ))}

        {game.pack.rounds[game.round].themes.map((theme) =>
          theme.questions.map((question) => (
            <QuestionValue key={question.text} score={question.points}/>
          )))}
      </form>

      <form className={styles.footer}>
        <button type="submit">Buzz In</button>
        <button type="submit">Skip Question</button>
      </form>
    </>
  );
};
