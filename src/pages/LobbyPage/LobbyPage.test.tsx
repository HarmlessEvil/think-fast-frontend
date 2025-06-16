import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LobbyPage } from './LobbyPage.tsx';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { meQueryOptions } from '../../components/auth/api.ts';
import { server } from '../../mocks/node.ts';
import { http, HttpResponse } from 'msw';

server.use(http.get('/api/me', () => {
  return HttpResponse.json({
    id: 'test',
    username: 'Alice',
  });
}));

describe('LobbyPage', () => {
  test('renders lobby with players', async () => {
    const queryClient = new QueryClient();
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LobbyPage/>,
        loader: async () => {
          await queryClient.prefetchQuery(meQueryOptions);
          return {
            players: {
              test: {
                profile: {
                  id: 'test',
                  username: 'Alice',
                },
              },
            },
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

    expect(await screen.findByText(/^Alice/)).toBeInTheDocument();
  });

  test('renders start game button', async () => {
    const queryClient = new QueryClient();
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LobbyPage/>,
        loader: async () => {
          await queryClient.prefetchQuery(meQueryOptions);
          return {
            host: 'test',
            players: {},
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

    expect(await screen.findByRole('button', { name: 'Start Game' })).toBeInTheDocument();
  });

  test('renders lobby code', async () => {
    const queryClient = new QueryClient();
    const router = createMemoryRouter([
      {
        path: '/:lobby',
        element: <LobbyPage/>,
        loader: async () => {
          await queryClient.prefetchQuery(meQueryOptions);
          return {
            players: {},
          };
        },
        hydrateFallbackElement: <></>,
      },
    ], {
      initialEntries: ['/test-lobby'],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/test-lobby$/)).toBeInTheDocument();
  });
});
