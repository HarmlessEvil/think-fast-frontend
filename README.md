# Think Fast!

This repository contains the front-end implementation for our multiplayer trivia game, inspired by the “Jeopardy!”
format. The application is built using modern web technologies for seamless gameplay across devices.

## Features

* TailwindCSS styling for a fast and consistent design.
* WebSocket integration for real-time updates.
* Intuitive game interface with:
    * Lobby management (player list, ready/unready toggle, start game).
    * Interactive game board with categories and questions.
    * Player actions like buzzing in and answering questions.

## Key Pages

1. [Home Page](src/pages/HomePage/HomePage.tsx):
    * Join an existing lobby or create a new one.
2. [Lobby Page](src/pages/LobbyPage/LobbyPage.tsx):
    * Displays the player list, ready/unready status, and start game button.
3. [Game Page](src/pages/GamePage/GamePage.tsx):
    * Interactive question grid and action buttons for gameplay.

## Technologies Used

* [React](https://react.dev): Component-based UI library.
* [TailwindCSS](https://tailwindcss.com): Utility-first CSS framework.
* [Vite](https://vite.dev): Fast development build tool.
* [Zustand](https://zustand-demo.pmnd.rs): A small, fast, and scalable bearbones state management solution.

## License

This project is licensed under Apache 2.0 license. See the [LICENSE](LICENSE) file for details.
