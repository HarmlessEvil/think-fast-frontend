import { Params } from 'react-router-dom';
import { getGame } from '../../components/game/api.ts';

export const loader = async ({ params }: { params: Params<'lobby'> }) =>
  getGame(params.lobby!);
