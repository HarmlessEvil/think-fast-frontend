import { createContext } from 'react';
import { z } from 'zod';
import { gameSnapshotSchema, playerProfileSchema } from './schemas.ts';

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

export type GameAction = |
  {
    type: 'ready'
    data: null
  } |
  {
    type: 'unready'
    data: null
  } |
  {
    type: 'choose-question'
    data: {
      questionIndex: number
      themeIndex: number
    }
  } |
  {
    type: 'buzz-in'
    data: null
  } |
  {
    type: 'accept-answer'
    data: null
  } |
  {
    type: 'reject-answer'
    data: null
  }

export type GameEvent = z.infer<typeof gameEventSchema>

const gameEventSchema = z.union([
  z.object({
    type: z.literal('player-joined'),
    data: z.object({
      player: playerProfileSchema,
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
    type: z.literal('players-returned-to-lobby'),
    data: z.object({
      players: z.array(z.string()),
    }),
  }),

  z.object({
    type: z.literal('game-started'),
    data: z.object({}),
  }),

  z.object({
    type: z.literal('snapshot-taken'),
    data: gameSnapshotSchema,
  }),

  z.object({
    type: z.literal('question-chosen'),
    data: z.object({
      questionIndex: z.number(),
      questionText: z.string(),
      themeIndex: z.number(),
    }),
  }),

  z.object({
    type: z.literal('buzz-in-allowed'),
    data: z.object({}),
  }),

  z.object({
    type: z.literal('question-timed-out'),
    data: z.object({
      questionIndex: z.number(),
      themeIndex: z.number(),
    }),
  }),

  z.object({
    type: z.literal('buzzed-in'),
    data: z.object({
      playerID: z.string(),
    }),
  }),

  z.object({
    type: z.literal('answer-rejected'),
    data: z.object({
      playerID: z.string(),
      questionIndex: z.number(),
      themeIndex: z.number(),
    }),
  }),

  z.object({
    type: z.literal('answer-accepted'),
    data: z.object({
      playerID: z.string(),
      questionIndex: z.number(),
      themeIndex: z.number(),
    }),
  }),

  z.object({
    type: z.literal('round-ended'),
    data: z.object({
      roundIndex: z.number(),
    }),
  }),
]);

export const WebsocketContext = createContext<WebsocketManager | null>(null);
