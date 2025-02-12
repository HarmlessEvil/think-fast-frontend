import { gameSnapshotSchema, playerProfileSchema } from './schemas.ts';
import { z } from 'zod';

export type GameSnapshot = z.infer<typeof gameSnapshotSchema>

export type PlayerID = PlayerProfile['id']

export type PlayerProfile = z.infer<typeof playerProfileSchema>
