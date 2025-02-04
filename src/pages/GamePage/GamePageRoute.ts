import { Params } from 'react-router-dom';
import { getGame } from '../../components/Game/api.ts';

export const loader = async ({ params }: { params: Params<'lobby'> }) =>
  getGame(params.lobby!);
