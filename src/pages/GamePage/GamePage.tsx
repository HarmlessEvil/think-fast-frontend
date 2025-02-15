import { useCallback, useContext, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import styles from './GamePage.module.css';
import { loader } from './GamePageRoute.ts';
import { Question, QuestionBoard } from '../../components/Game/QuestionBoard.tsx';
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '../../components/Auth/api.ts';
import { exitToLobby } from '../../components/Game/api.ts';

const countQuestions = (themes: { questions: unknown[] }[]): number =>
  themes.map(theme => theme.questions.length).reduce((a, b) => a + b, 0);

export const GamePage = () => {
  const [game, setGame] = useState(useLoaderData() as Awaited<ReturnType<typeof loader>>);

  const navigate = useNavigate();

  const { lobby } = useParams<'lobby'>();
  const lobbyID = lobby!;

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
        },
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
          },
        };
      });
    });

    // TODO: Handle answer time-out

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
            },
          },
        };
      });
    });

    websocketManager.on('answer-rejected', (event) => {
      setGame(game => {
        if (game.state.name !== 'answer-evaluation') {
          throw new Error('unexpected state');
        }

        const playerID = game.state.state.player;
        const player = game.players[playerID];
        const question = game.pack.rounds[game.roundIndex].themes[event.themeIndex].questions[event.questionIndex];

        return {
          ...game,
          players: { ...game.players, [playerID]: { ...player, score: player.score - question.points } },
          state: {
            name: 'buzzing-in',
            state: game.state.state.stateBuzzingIn,
          },
        };
      });
    });

    websocketManager.on('answer-accepted', event => {
      setGame(game => {
        if (game.state.name !== 'answer-evaluation') {
          throw new Error('unexpected state');
        }

        const playerID = game.state.state.player;
        const player = game.players[playerID];

        const themes = game.pack.rounds[game.roundIndex].themes;
        const question = themes[event.themeIndex].questions[event.questionIndex];

        const playedQuestions: typeof game['playedQuestions'] = game.playedQuestions
          ? new Set(game.playedQuestions)
          : new Set();

        const isNextRound = playedQuestions.size + 1 >= countQuestions(themes);

        if (isNextRound) {
          playedQuestions.clear();
        } else {
          playedQuestions.add({ questionIndex: event.questionIndex, themeIndex: event.themeIndex });
        }

        const roundIndex = isNextRound ? game.roundIndex + 1 : game.roundIndex;
        const isGameOver = isNextRound && roundIndex >= game.pack.rounds.length;

        const stateName = isGameOver
          ? 'game-over'
          : 'question-selection';

        return {
          ...game,
          currentPlayer: playerID,
          playedQuestions: playedQuestions,
          players: { ...game.players, [playerID]: { ...player, score: player.score + question.points } },
          roundIndex: roundIndex,
          state: {
            name: stateName,
            state: {},
          },
        };
      });
    });

    websocketManager.on('players-returned-to-lobby', (event) => {
      if (event.players.includes(me.id)) {
        navigate('..', { relative: 'path' });
      }
    });

    websocketManager.onClose((closedByClient, { wasClean }) => {
      if (!closedByClient && wasClean) {
        navigate('/');
      }
    });

    return () => {
      websocketManager.off('question-chosen');
      websocketManager.off('buzz-in-allowed');
      websocketManager.off('buzzed-in');
      websocketManager.off('answer-rejected');
      websocketManager.off('answer-accepted');
      websocketManager.off('players-returned-to-lobby');

      websocketManager.offClose();
    };
  }, [me.id, navigate, websocketManager]);

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

  const onExitToLobby = async () => {
    await exitToLobby(lobbyID);
    navigate('..', { relative: 'path' });
  };

  const renderGame = () => {
    const state = game.state;
    switch (state.name) {
      case 'question-selection':
        return <QuestionBoard
          onQuestionChosen={onQuestion}
          playedQuestions={game.playedQuestions ?? new Set()}
          themes={game.pack.rounds[game.roundIndex].themes}
        />;
      case 'question-display':
        return <p>{game.pack.rounds[game.roundIndex].themes[state.state.themeIndex].questions[state.state.questionIndex].points} {state.state.questionText}</p>;
      case 'buzzing-in':
        return <p>{game.pack.rounds[game.roundIndex].themes[state.state.stateQuestionDisplay.themeIndex].questions[state.state.stateQuestionDisplay.questionIndex].points} {state.state.stateQuestionDisplay.questionText}</p>;
      case 'answer-evaluation':
        return <p>{game.pack.rounds[game.roundIndex].themes[state.state.stateBuzzingIn.stateQuestionDisplay.themeIndex].questions[state.state.stateBuzzingIn.stateQuestionDisplay.questionIndex].points} {state.state.stateBuzzingIn.stateQuestionDisplay.questionText}</p>;
      case 'game-over':
        return <p>Thanks for playing! Now you can return to lobby if you want to play more.</p>;
      default:
        // `state satisfies never` is a  compile time check for exhaustive switch.
        // It should be never if all cases are handled. Source: https://stackoverflow.com/a/75217377/7149107
        //
        // `as typeof game['state']` erases cast information to make this code compile if the switch is exhaustive.
        // Thus, if the error is ignored, a message would be displayed in runtime.
        return <p>Unknown game state {((state satisfies never) as typeof game['state']).name}</p>;
    }
  };

  const renderButtons = () => {
    const state = game.state;
    switch (state.name) {
      case 'buzzing-in':
        if (!isHost) {
          return <button onClick={onBuzzIn} type="button">Buzz In</button>;
        }

        break;
      case 'answer-evaluation':
        if (isHost) {
          return [
            <button key="accept" type="button" onClick={onAcceptAnswer}>Accept answer</button>,
            <button key="reject" type="button" onClick={onRejectAnswer}>Reject answer</button>,
          ];
        }

        break;
      case 'game-over':
        return <button type="button" onClick={onExitToLobby}>Exit to Lobby</button>;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1>"{game.pack.name}" Pack</h1>
        {game.state.name !== 'game-over' && <p>Round {game.roundIndex + 1}</p>}
        <div className={styles.score}>
          {Object.values(game.players).map((player) => (
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
