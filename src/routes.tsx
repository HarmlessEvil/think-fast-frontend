import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { GamePage } from './pages/GamePage/GamePage.tsx';
import { HomePage } from './pages/HomePage/HomePage.tsx';
import { action as homePageAction } from './pages/HomePage/HomePageRoute.ts';
import { LobbyPage } from './pages/LobbyPage/LobbyPage.tsx';
import { loader as lobbyPageLayoutLoader } from './pages/LobbyPageLayout/LobbyPageLayoutRoute.ts';
import { LobbyPageLayout } from './pages/LobbyPageLayout/LobbyPageLayout.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        index: true,
        element: <HomePage/>,
        action: homePageAction,
      },
      {
        id: 'lobby-layout',
        path: 'lobby/:lobby',
        element: <LobbyPageLayout/>,
        loader: lobbyPageLayoutLoader,
        children: [
          {
            index: true,
            element: <LobbyPage/>,
          },
          {
            path: 'game',
            element: <GamePage/>,
          },
        ],
      },
    ],
  },
]);
