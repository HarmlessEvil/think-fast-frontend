import { createContext } from 'react';
import { z } from 'zod';

export class WebsocketManager {
  private isClosed: boolean = false;
  private socket: WebSocket | null = null;
  private timeout: number | null = null;

  private readonly handlers: { [E in GameEvent as E['type']]?: (data: E['data']) => void } = {};

  constructor(private readonly url: string) {
    this.connect();
  }

  close() {
    this.isClosed = true;

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    this.socket?.close();
  }

  private connect() {
    this.timeout = null;
    this.socket = new WebSocket(this.url);

    this.socket.onmessage = (event) => this.handleMessage(event);
    this.socket.onclose = () => this.handleClose();
  }

  private handleMessage(event: MessageEvent) {
    const message = gameEventSchema.parse(JSON.parse(event.data));
    const handler = this.handlers[message.type];

    if (handler) {
      handler(message.data as never);
    }
  }

  private handleClose() {
    if (!this.isClosed) { // retry only server-side close
      this.timeout = setTimeout(this.connect.bind(this), 3_000);
    }
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

export type GameAction =
  | { type: 'ready'; data: null }
  | { type: 'unready'; data: null }
  | { type: 'choose-question'; data: { QuestionIndex: number } }

export type GameEvent = z.infer<typeof gameEventSchema>

const gameEventSchema = z.union([
  z.object({
    type: z.literal('player-joined'),
    data: z.object({
      player: z.object({
        isReady: z.boolean(),
        profile: z.object({
          id: z.string(),
          username: z.string(),
        }),
        score: z.number(),
      }),
    }),
  }),

  z.object({
    type: z.literal('player-left'),
    data: z.object({
      playerID: z.string(),
    }),
  }),

  z.object({
    type: z.literal('player-readied'),
    data: z.object({
      playerID: z.string(),
    }),
  }),

  z.object({
    type: z.literal('player-unreadied'),
    data: z.object({
      playerID: z.string(),
    }),
  }),

  z.object({
    type: z.literal('game-started'),
    data: z.object({}),
  }),
]);

export const WebsocketContext = createContext<WebsocketManager | null>(null);
