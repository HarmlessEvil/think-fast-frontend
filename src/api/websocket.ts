import { createContext, useContext } from 'react';
import { z } from 'zod';

export class WebsocketManager {
  private socket: WebSocket | null = null;
  private readonly handlers: { [E in GameEvent as E['type']]?: (data: E['data']) => void } = {};

  constructor(url: string) {
    this.connect(url);
  }

  private connect(url: string) {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      const message = gameEventSchema.parse(JSON.parse(event.data));
      const handler = this.handlers[message.type];

      if (handler) {
        handler(message.data as never);
      }
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connect(url), 3_000);
    };
  }

  close() {
    this.socket?.close();
  }

  send(action: GameAction) {
    this.socket?.send(JSON.stringify(action));
  }

  on<E extends GameEvent['type']>(eventType: E, handler: (data: Extract<GameEvent, { type: E }>['data']) => void) {
    this.handlers[eventType] = handler as never;
  }

  off(eventType: GameEvent['type']) {
    delete this.handlers[eventType];
  }
}

type GameAction =
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'choose-question'; data: { QuestionIndex: number } }

type GameEvent = z.infer<typeof gameEventSchema>

const gameEventSchema = z.union([
  z.object({
    type: z.literal('player-joined'),
    data: z.object({
      player: z.object({
        id: z.string(),
        isReady: z.boolean(),
        score: z.number(),
        username: z.string(),
      }),
    }),
  }),

  z.object({
    type: z.literal('player-left'),
    data: z.object({
      playerID: z.string(),
    }),
  }),
]);

export const WebsocketContext = createContext<WebsocketManager | null>(null);

export const useWebsocket = () => {
  const context = useContext(WebsocketContext)
  if (!context) {
    throw new Error('useWebsocket must be used within WebsocketProvider');
  }

  return context;
}
