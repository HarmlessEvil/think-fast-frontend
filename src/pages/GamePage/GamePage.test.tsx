import { describe, expect, test } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { meQueryOptions } from '../../components/auth/api.ts';
import { render, screen } from '@testing-library/react';
import { GamePage } from './GamePage.tsx';
import { server } from '../../mocks/node.ts';
import { http, HttpResponse } from 'msw';

server.use(http.get('/api/me', () => {
  return HttpResponse.json({
    id: 'test',
    username: 'Alice',
  });
}));

describe('GamePage', () => {
  test('shows player as answering after buzzing in', async () => {
    const queryClient = new QueryClient();
    const router = createMemoryRouter([
      {
        path: '/',
        element: <GamePage/>,
        loader: async () => {
          await queryClient.prefetchQuery(meQueryOptions);
          return {
            pack: {
              name: 'Demo',
              rounds: [{
                themes: [{
                  questions: [{
                    points: 100,
                  }],
                }],
              }],
            },
            state: {
              name: 'answer-evaluation',
              state: {
                player: 'test',
                stateBuzzingIn: {
                  stateQuestionDisplay: {
                    questionContent: [{ text: 'Which content should a question have?' }],
                    questionIndex: 0,
                    themeIndex: 0,
                  },
                },
              },
            },
            players: {
              test: {
                profile: {
                  id: 'test',
                  username: 'Alice',
                },
              },
            },
            roundIndex: 0,
          };
        },
        hydrateFallbackElement: <></>,
      },
    ], {
      initialEntries: ['/'],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Alice answers')).toBeInTheDocument();
  });

  test('shows theme name', async () => {
    const queryClient = new QueryClient();
    const router = createMemoryRouter([
      {
        path: '/',
        element: <GamePage/>,
        loader: async () => {
          await queryClient.prefetchQuery(meQueryOptions);
          return {
            pack: {
              name: 'Demo',
              rounds: [{
                themes: [{
                  name: 'Board Games',
                  questions: [{
                    points: 100,
                  }],
                }],
              }],
            },
            state: {
              name: 'question-display',
              state: {
                buzzInAt: new Date(),
                questionContent: [{ text: 'Which content should a question have?' }],
                questionIndex: 0,
                themeIndex: 0,
              },
            },
            players: {
              test: {
                profile: {
                  id: 'test',
                  username: 'Alice',
                },
              },
            },
            roundIndex: 0,
          };
        },
        hydrateFallbackElement: <></>,
      },
    ], {
      initialEntries: ['/'],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Theme: Board Games')).toBeInTheDocument();
  });
});
