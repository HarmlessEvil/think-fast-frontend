import { createContext } from 'react';
import { z } from 'zod';
import { gameSnapshotSchema, playerProfileSchema, questionContentItemSchema } from './schemas.ts';
import { redirectToLogin } from './client.ts';

export class WebsocketManager {
  private isClosed: boolean = false;
  private socket: WebSocket | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  private readonly handlers: { [E in GameEvent as E['type']]?: (data: E['data']) => void } = {};
  private closeHandler: ((closedByClient: boolean, event: CloseEvent) => void) | null = null;

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

  onClose(handler: (closedByClient: boolean, event: CloseEvent) => void) {
    this.closeHandler = handler;
  }

  offClose() {
    this.closeHandler = null;
  }

  private connect() {
    this.timeout = null;
    this.socket = new WebSocket(this.url);

    this.socket.onmessage = (event) => this.handleMessage(event);
    this.socket.onclose = (event) => this.handleClose(event);
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

  private handleMessage(event: MessageEvent) {
    const message = gameEventSchema.parse(JSON.parse(event.data));
    const handler = this.handlers[message.type];

    handler?.(message.data as never);
  }

  private handleClose(event: CloseEvent) {
    if (event.wasClean && event.code === CloseStatus.Unauthenticated) {
      redirectToLogin();
    }

    this.closeHandler?.(this.isClosed, event);

    if (!this.isClosed && !event.wasClean) { // retry only server-side unexpected close
      this.timeout = setTimeout(this.connect.bind(this), 3_000);
    }
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
      buzzInAt: z.coerce.date(),
      questionContent: z.array(questionContentItemSchema).nullish().transform(c => c ?? []),
      questionIndex: z.number(),
      themeIndex: z.number(),
    }),
  }),

  z.object({
    type: z.literal('buzz-in-allowed'),
    data: z.object({
      timeoutAt: z.coerce.date(),
    }),
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

/**
 * Known websocket close statuses.
 */
export enum CloseStatus {
  /**
   * Client needs to be authenticated.
   */
  Unauthenticated = 3_000,
  /**
   * Resource requested by client is not found.
   */
  NotFound = 3_001
}

export const WebsocketContext = createContext<WebsocketManager | null>(null);
