import { useCallback, useContext, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { WebsocketContext } from '../../api/websocket.ts';
import styles from './GamePage.module.css';
import { Question, QuestionBoard } from '../../components/game/QuestionBoard.tsx';
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '../../components/auth/api.ts';
import { exitToLobby } from '../../components/game/api.ts';
import { GameSnapshot } from '../../api/types.ts';
import { Timer } from '../../components/game/Timer.tsx';

type QuestionIndex = {
  questionIndex: number
  themeIndex: number
};

type Theme = {
  questions: unknown[]
};

const countQuestions = (themes: Theme[]): number =>
  themes.map(theme => theme.questions.length).reduce((a, b) => a + b, 0);

const firstQuestionText = (content: {
  text: string
  type: string
}[]): string => content.filter(it => it.text !== '' && it.type === '')[0]?.text ?? '';

const firstQuestionImage = (content: {
  text: string
  type: string
}[]): string => content.filter(it => it.text !== '' && it.type === 'image')[0]?.text ?? '';

/**
 * Modifies the game to mark a given question as played.
 * It advances the game to the next round if the current round has no more question,
 * or ends the game if the game has no more rounds.
 * @param game snapshot of the game state.
 * @param questionIndex index of the played question.
 */
const markQuestionAsPlayed = (
  game: GameSnapshot,
  questionIndex: QuestionIndex,
) => {
  const playedQuestions: typeof game['playedQuestions'] = game.playedQuestions
    ? new Set(game.playedQuestions)
    : new Set();

  const themes = game.pack.rounds[game.roundIndex].themes;
  const isNextRound = playedQuestions.size + 1 >= countQuestions(themes);

  if (isNextRound) {
    playedQuestions.clear();
  } else {
    playedQuestions.add(`${questionIndex.themeIndex}:${questionIndex.questionIndex}`);
  }

  const roundIndex = isNextRound ? game.roundIndex + 1 : game.roundIndex;
  const isGameOver = isNextRound && roundIndex >= game.pack.rounds.length;

  game.playedQuestions = playedQuestions;
  game.roundIndex = roundIndex;

  if (isGameOver) {
    game.state = { name: 'game-over', state: {} };
  } else {
    game.state = { name: 'question-selection', state: {} };
  }
};

export const GamePage = () => {
  const [game, setGame] = useState(useLoaderData() as GameSnapshot);

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

    websocketManager.on('buzz-in-allowed', ({ timeoutAt }) => {
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
              timeoutAt: timeoutAt,
            },
          },
        };
      });
    });

    websocketManager.on('question-timed-out', event => {
      setGame(game => {
        if (game.state.name !== 'buzzing-in') {
          throw new Error('unexpected state');
        }

        const nextGameState = { ...game };
        markQuestionAsPlayed(nextGameState, { questionIndex: event.questionIndex, themeIndex: event.themeIndex });

        return nextGameState;
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
                ...game.state.state,
                buzzedIn: { ...game.state.state.buzzedIn, [event.playerID]: new Date() },
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
        const question = (game.pack.rounds[game.roundIndex].themes)[event.themeIndex].questions[event.questionIndex];

        const nextGameState = {
          ...game,
          players: { ...game.players, [playerID]: { ...player, score: player.score - question.points } },
        };

        const stateBuzzingIn = game.state.state.stateBuzzingIn;
        const isQuestionSkipped = stateBuzzingIn.timeoutAt.getTime() <= Date.now()
          || Object.keys(stateBuzzingIn.buzzedIn).length >= Object.keys(game.players).length;

        if (isQuestionSkipped) {
          markQuestionAsPlayed(nextGameState, { questionIndex: event.questionIndex, themeIndex: event.themeIndex });
        } else {
          nextGameState.state = {
            name: 'buzzing-in',
            state: stateBuzzingIn,
          };
        }

        return nextGameState;
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

        const nextGameState = {
          ...game,
          currentPlayer: playerID,
          players: { ...game.players, [playerID]: { ...player, score: player.score + question.points } },
        };

        markQuestionAsPlayed(nextGameState, { questionIndex: event.questionIndex, themeIndex: event.themeIndex });
        return nextGameState;
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
      websocketManager.off('question-timed-out');
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
          disabled={game.currentPlayer !== me.id}
          onQuestionChosen={onQuestion}
          playedQuestions={game.playedQuestions ?? new Set()}
          themes={game.pack.rounds[game.roundIndex].themes}
        />;
      case 'question-display': {
        const questionContent = state.state.questionContent;

        const theme = game.pack.rounds[game.roundIndex].themes[state.state.themeIndex];

        const image = firstQuestionImage(questionContent);
        const text = firstQuestionText(questionContent);

        return (
          <>
            <p>Theme: {theme.name}</p>
            <p>{theme.questions[state.state.questionIndex].points} {text}</p>
            {image && <img src={image} alt={text}/>}
            <p>
              Prepare to buzz-in in: <Timer until={state.state.buzzInAt}/>
            </p>
          </>
        );
      }
      case 'buzzing-in': {
        const questionContent = state.state.stateQuestionDisplay.questionContent;

        const theme = game.pack.rounds[game.roundIndex].themes[state.state.stateQuestionDisplay.themeIndex];
        const question = theme.questions[state.state.stateQuestionDisplay.questionIndex];

        return (
          <>
            <p>Theme: {theme.name}</p>
            <p>{question.points} {firstQuestionText(questionContent)}</p>
            {isHost && <p>Right answer is: {question.rightAnswer}</p>}
            <p>Timeout in: <Timer until={state.state.timeoutAt}/></p>
          </>
        );
      }
      case 'answer-evaluation': {
        const questionContent = state.state.stateBuzzingIn.stateQuestionDisplay.questionContent;

        const theme = game.pack.rounds[game.roundIndex].themes[state.state.stateBuzzingIn.stateQuestionDisplay.themeIndex];
        const question = theme.questions[state.state.stateBuzzingIn.stateQuestionDisplay.questionIndex];

        return (<>
          <p>Theme: {theme.name}</p>
          <p>{question.points} {firstQuestionText(questionContent)}</p>
          <p>{game.players[state.state.player].profile.username} answers</p>
          {isHost && <p>Right answer is: {question.rightAnswer}</p>}
        </>);
      }
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
        if (!isHost && !(me.id in state.state.buzzedIn)) {
          return <button onClick={onBuzzIn} type="button">Buzz In</button>;
        }

        break;
      case 'answer-evaluation':
        if (isHost) {
          return (
            <>
              <button type="button" onClick={onAcceptAnswer}>Accept answer</button>
              <button type="button" onClick={onRejectAnswer}>Reject answer</button>
            </>
          );
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
            <span key={player.profile.id}>
              {player.profile.id === game.currentPlayer && '(c)'} {player.profile.username}: {player.score}
              {player.profile.id === me.id && ' (you)'}
            </span>
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
