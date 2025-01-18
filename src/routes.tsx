import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { GamePage } from './pages/GamePage/GamePage.tsx';
import { HomePage } from './pages/HomePage/HomePage.tsx';
import { action as homePageAction } from './pages/HomePage/HomePageRoute.ts';
import { LobbyPage } from './pages/LobbyPage/LobbyPage.tsx';
import { loader as lobbyPageLoader } from './pages/LobbyPage/LobbyPageRoute.ts';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/',
        element: <HomePage/>,
        action: homePageAction,
      },
      {
        path: '/lobby/:lobby',
        element: <LobbyPage/>,
        loader: lobbyPageLoader,
      },
      {
        path: '/game/:game',
        element: <GamePage/>,
      },
    ],
  },
]);
