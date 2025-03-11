import { test } from './fixtures';
import { http, HttpResponse } from 'msw';
import { WebSocketRoute } from '@playwright/test';

test.describe('game tests', () => {
  test('player who buzzes in is displayed as answering', async ({ page, worker }) => {
    await worker.use(http.get('/api/me', () => HttpResponse.json({
        id: 'test-user',
        name: 'John',
      }),
    ));

    await worker.use(http.get('/api/lobby/test-lobby/game', () => HttpResponse.json({
      currentPlayer: 'test-player',
      host: 'test-host',
      pack: {
        name: 'Demo',
        rounds: [{
          name: 'Test Round 1',
          themes: [{
            name: 'Theme 1',
            questions: [{
              points: 100,
            }],
          }],
        }],
      },
      playedQuestions: [],
      state: {
        name: 'buzzing-in',
        state: {
          buzzedIn: {},
          stateQuestionDisplay: {
            questionContent: [{
              text: 'Which content should a question have?',
              type: '',
            }],
            questionIndex: 0,
            themeIndex: 0,
          },
        },
      },
      players: {
        'test-user': {
          profile: {
            id: 'test-user',
            username: 'John',
          },
          score: 0,
        },
      },
      roundIndex: 0,
    })));

    let ws: WebSocketRoute | null = null;
    await page.routeWebSocket(new RegExp('/ws/lobby/test-lobby$'), wsr => {
      ws = wsr;

      ws.onMessage((msg: string) => {
        const message = JSON.parse(msg);
        if (message.type === 'buzz-in') {
          ws.send(JSON.stringify({
            type: 'buzzed-in',
            data: {
              playerID: 'test-user',
            },
          }));
        }
      });
    });

    await page.goto('/lobby/test-lobby/game');

    await test.expect(page.getByText('John answers')).not.toBeVisible();

    await page.getByRole('button', { name: 'Buzz in' }).click();

    await test.expect(page.getByText('John answers')).toBeVisible();

    ws.send(JSON.stringify({
      type: 'answer-accepted',
      data: {
        playerID: 'test-player',
        questionIndex: 0,
        themeIndex: 0,
      },
    }));

    await test.expect(page.getByText('John answers')).not.toBeVisible();
  });
});
