import React, { useCallback, useContext, useEffect } from 'react';
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

  const onQuestion = useCallback((e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    if (!websocketManager) {
      return;
    }

    const submitter = e.nativeEvent.submitter;
    if (!submitter || (!(submitter instanceof HTMLButtonElement) && !(submitter instanceof HTMLInputElement))) {
      return;
    }

    const questionID = submitter.value;

    const [themeIndex, questionIndex] = questionID.split(':', 2).map(Number);
    websocketManager.send({ type: 'choose-question', data: { questionIndex, themeIndex } });
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

      <form className={styles.main} onSubmit={onQuestion}>
        {game.pack.rounds[game.round].themes.map((theme) => (
          <CategoryHeader key={theme.name} name={theme.name}/>
        ))}

        {game.pack.rounds[game.round].themes.map((theme, themeIndex) =>
          theme.questions.map((question, questionIndex) => (
            <QuestionValue
              key={question.text}
              questionIndex={questionIndex}
              score={question.points}
              themeIndex={themeIndex}
            />
          )))}
      </form>

      <footer className={styles.footer}>
        <button type="button">Buzz In</button>
        <button type="button">Skip Question</button>
      </footer>
    </>
  );
};
