import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LobbyPage } from './LobbyPage.tsx';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

vi.mock('@tanstack/react-query', async () => {
  const original = await vi.importActual('@tanstack/react-query');
  return {
    ...original,
    useQuery: vi.fn(() => ({ data: { id: 'test', username: 'Alice' } })),
  };
});

describe('LobbyPage', () => {
  test('renders lobby with players', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LobbyPage/>,
        loader: () => ({
          players: {
            test: {
              profile: {
                id: 'test',
                username: 'Alice',
              },
            },
          },
        }),
      },
    ], {
      initialEntries: ['/'],
      future: {
        v7_relativeSplatPath: true,
      },
    });

    render(<RouterProvider router={router} future={{ v7_startTransition: true }}/>);
    expect(await screen.findByText(/^Alice/)).toBeInTheDocument();
  });

  test('renders start game button', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LobbyPage/>,
        loader: () => ({
          host: 'test',
          players: {},
        }),
      },
    ], {
      initialEntries: ['/'],
      future: {
        v7_relativeSplatPath: true,
      },
    });

    render(<RouterProvider router={router} future={{ v7_startTransition: true }}/>);
    expect(await screen.findByRole('button', { name: 'Start Game' })).toBeInTheDocument();
  });

  test('renders lobby code', async () => {
    const router = createMemoryRouter([
      {
        path: '/:lobby',
        element: <LobbyPage/>,
        loader: () => ({
          players: {},
        }),
      },
    ], {
      initialEntries: ['/test-lobby'],
      future: {
        v7_relativeSplatPath: true,
      },
    });

    render(<RouterProvider router={router} future={{ v7_startTransition: true }}/>);
    expect(await screen.findByText(/test-lobby$/)).toBeInTheDocument();
  });
});
