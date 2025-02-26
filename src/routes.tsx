import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { GamePage } from './pages/GamePage/GamePage.tsx';
import { loader as gamePageLoader } from './pages/GamePage/GamePageRoute.ts';
import { HomePage } from './pages/HomePage/HomePage.tsx';
import { action as homePageAction } from './pages/HomePage/HomePageRoute.ts';
import { LobbyPage } from './pages/LobbyPage/LobbyPage.tsx';
import { action as lobbyPageAction, loader as lobbyPageLoader } from './pages/LobbyPage/LobbyPageRoute.ts';
import { LobbyPageLayout } from './pages/LobbyPageLayout/LobbyPageLayout.tsx';
import {
  action as lobbyPageLayoutAction,
  loader as lobbyPageLayoutLoader,
} from './pages/LobbyPageLayout/LobbyPageLayoutRoute.ts';
import { LoginPage } from './pages/LoginPage/LoginPage.tsx';
import { action as loginPageAction, loader as loginPageLoder } from './pages/LoginPage/LoginPageRoute.ts';

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
        loader: loginPageLoder,
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
            action: lobbyPageAction,
            loader: lobbyPageLoader,
          },
          {
            path: 'game',
            element: <GamePage/>,
            loader: gamePageLoader,
          },
        ],
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
});
