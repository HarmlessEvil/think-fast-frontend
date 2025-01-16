import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { GamePage } from './pages/GamePage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { LobbyPage } from './pages/LobbyPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/',
        element: <HomePage/>,
      },
      {
        path: '/lobby/:lobby',
        element: <LobbyPage/>,
      },
      {
        path: '/game/:game',
        element: <GamePage />
      }
    ],
  },
]);
