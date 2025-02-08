import { useCallback, useContext, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import styles from './GamePage.module.css';
import { loader } from './GamePageRoute.ts';
import { Question, QuestionBoard } from '../../components/Game/QuestionBoard.tsx';
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '../../components/Auth/api.ts';

export const GamePage = () => {
  const [game, setGame] = useState(useLoaderData() as Awaited<ReturnType<typeof loader>>);

  const { data: meQueryData } = useQuery(meQueryOptions);
  const me = meQueryData!;
  const isHost = game.host === me.id;

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

        return {
          ...game,
          state: {
            name: 'buzzing-in',
            state: {
              buzzedIn: {},
              stateQuestionDisplay: game.state.state,
            },
          }
        };
      });
    });

    websocketManager.on('buzzed-in', (event) => {
      setGame(game => {
        if (game.state.name !== 'buzzing-in') {
          throw new Error('unexpected state');
        }

        return {
          ...game,
          state: {
            name: 'answer-evaluation',
            state: {
              player: event.playerID,
              stateBuzzingIn: {
                buzzedIn: { ...game.state.state.buzzedIn, [event.playerID]: new Date() },
                stateQuestionDisplay: game.state.state.stateQuestionDisplay,
              },
            }
          }
        };
      });
    });

    return () => {
      websocketManager.off('question-chosen');
      websocketManager.off('buzz-in-allowed');
      websocketManager.off('buzzed-in');
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

  const onAcceptAnswer = useCallback(() => {
    if (!websocketManager) {
      return;
    }

    websocketManager.send({ type: 'accept-answer', data: null });
  }, [websocketManager]);

  const onRejectAnswer = useCallback(() => {
    if (!websocketManager) {
      return;
    }

    websocketManager.send({ type: 'reject-answer', data: null });
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
      case 'answer-evaluation':
        return JSON.stringify(game.pack.rounds[game.roundIndex].themes[state.state.stateBuzzingIn.stateQuestionDisplay.themeIndex].questions[state.state.stateBuzzingIn.stateQuestionDisplay.questionIndex]);
      default:
        return <p>Unknown game state {state.name}</p>;
    }
  };

  const renderButtons = () => {
    const state = game.state;
    switch (state.name) {
      case 'buzzing-in':
        return <button onClick={onBuzzIn} type="button">Buzz In</button>;
      case 'answer-evaluation':
        if (isHost) {
          return [
            <button key="accept" type="button" onClick={onAcceptAnswer}>Accept answer</button>,
            <button key="reject" type="button" onClick={onRejectAnswer}>Reject answer</button>,
          ];
        }
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
        {renderButtons()}
      </footer>
    </>
  );
};
