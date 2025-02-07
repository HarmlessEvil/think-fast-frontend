import { useCallback, useContext, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import styles from './GamePage.module.css';
import { loader } from './GamePageRoute.ts';
import { Question, QuestionBoard } from '../../components/Game/QuestionBoard.tsx';

export const GamePage = () => {
  const [game, setGame] = useState(useLoaderData() as Awaited<ReturnType<typeof loader>>);
  const buzzInAllowed = game.state.name === 'buzzing-in';

  const websocketManager = useContext(WebsocketContext);

  useEffect(() => {
    if (!websocketManager) {
      return;
    }

    websocketManager.on('question-chosen', (event) => {
      setGame(game => ({
        ...game,
        state: {
          name: 'question-display',
          state: event,
        }
      }));
    });

    websocketManager.on('buzz-in-allowed', () => {
      setGame(game => {
        if (game.state.name !== 'question-display') {
          throw new Error('unexpected state');
        }

        return ({
          ...game,
          state: {
            name: 'buzzing-in',
            state: {
              buzzedIn: {},
              stateQuestionDisplay: game.state.state,
            },
          }
        });
      });
    });

    return () => {
      websocketManager.off('question-chosen');
    };
  }, [websocketManager]);

  const onQuestion = useCallback((question: Question) => {
    if (!websocketManager) {
      return;
    }

    websocketManager.send({ type: 'choose-question', data: question });
  }, [websocketManager]);

  const onBuzzIn = useCallback(() => {
    if (!websocketManager) {
      return;
    }

    websocketManager.send({ type: 'buzz-in', data: null });
  }, [websocketManager]);

  const renderGame = () => {
    const state = game.state;
    switch (state.name) {
      case 'question-selection':
        return <QuestionBoard onQuestionChosen={onQuestion} themes={game.pack.rounds[game.roundIndex].themes}/>;
      case 'question-display':
        return JSON.stringify(game.pack.rounds[game.roundIndex].themes[state.state.themeIndex].questions[state.state.questionIndex]);
      case 'buzzing-in':
        return JSON.stringify(game.pack.rounds[game.roundIndex].themes[state.state.stateQuestionDisplay.themeIndex].questions[state.state.stateQuestionDisplay.questionIndex]);
      default:
        return <p>Unknown game state {state.name}</p>;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1>"{game.pack.name}" Pack</h1>
        <p>Round {game.roundIndex + 1}</p>
        <div className={styles.score}>
          {game.players.map((player) => (
            <span key={player.profile.id}>{player.profile.username}: {player.score}</span>
          ))}
        </div>
      </header>

      {renderGame()}

      <footer className={styles.footer}>
        <button disabled={!buzzInAllowed} onClick={onBuzzIn} type="button">Buzz In</button>
        <button type="button">Skip Question</button>
      </footer>
    </>
  );
};
