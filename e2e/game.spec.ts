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

  test('only the host can see correct answer during evaluation', async ({ context }) => {
    await context.route('/api/lobby/test-lobby/game', route => {
      return route.fulfill({
        json: {
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
                  rightAnswer: 'Informative.',
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
        },
      });
    });

    const wsRoutes: WebSocketRoute[] = [];
    await context.routeWebSocket(new RegExp('/ws/lobby/test-lobby$'), ws => {
      wsRoutes.push(ws);

      ws.onMessage((msg: string) => {
        const message = JSON.parse(msg);
        switch (message.type) {
          case 'buzz-in':
            for (const r of wsRoutes) {
              r.send(JSON.stringify({
                type: 'buzzed-in',
                data: {
                  playerID: 'test-user',
                },
              }));
            }
            return;
          case 'accept-answer':
            for (const r of wsRoutes) {
              r.send(JSON.stringify({
                type: 'answer-accepted',
                data: {
                  playerID: 'test-user',
                  questionIndex: 0,
                  themeIndex: 0,
                },
              }));
            }
            return;
        }
      });
    });

    const hostPage = await context.newPage();
    await hostPage.route('/api/me', route => {
      return route.fulfill({
        json: {
          id: 'test-host',
          name: 'Host',
        },
      });
    });

    const playerPage = await context.newPage();
    await playerPage.route('/api/me', route => {
      return route.fulfill({
        json: {
          id: 'test-player',
          name: 'John',
        },
      });
    });

    await hostPage.goto('/lobby/test-lobby/game');

    await playerPage.goto('/lobby/test-lobby/game');
    await playerPage.getByRole('button', { name: 'Buzz in' }).click();

    await test.expect(hostPage.getByText('Right answer is: Informative.')).toBeVisible();
    await test.expect(playerPage.getByText('Right answer is: Informative.')).not.toBeVisible();

    await hostPage.getByRole('button', { name: 'Accept answer' }).click();

    await test.expect(hostPage.getByText('Right answer is: Informative.')).not.toBeVisible();
    await test.expect(playerPage.getByText('Right answer is: Informative.')).not.toBeVisible();
  });
});
