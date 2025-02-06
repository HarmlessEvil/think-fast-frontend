import { gameSnapshotSchema } from './schemas.ts';
import { z } from 'zod';

export type GameSnapshot = z.infer<typeof gameSnapshotSchema>
