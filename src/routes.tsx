import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { GamePage } from './pages/GamePage/GamePage.tsx';
import { HomePage } from './pages/HomePage/HomePage.tsx';
import { action as homePageAction } from './pages/HomePage/HomePageRoute.ts';
import { LobbyPage } from './pages/LobbyPage/LobbyPage.tsx';
import { action as lobbyPageLayoutAction, loader as lobbyPageLayoutLoader } from './pages/LobbyPageLayout/LobbyPageLayoutRoute.ts';
import { LobbyPageLayout } from './pages/LobbyPageLayout/LobbyPageLayout.tsx';
import { LoginPage } from './pages/LoginPage/LoginPage.tsx';
import { action as loginPageAction } from './pages/LoginPage/LoginPageRoute.ts';

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
        path: 'login',
        element: <LoginPage/>,
        action: loginPageAction,
      },
      {
        id: 'lobby-layout',
        path: 'lobby/:lobby',
        element: <LobbyPageLayout/>,
        action: lobbyPageLayoutAction,
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
