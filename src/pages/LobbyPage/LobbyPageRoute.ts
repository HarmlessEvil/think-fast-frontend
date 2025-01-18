import { Params } from 'react-router-dom';
import { getLobby } from '../../components/Lobby/api.ts';

export const loader = async ({ params }: { params: Params<'lobby'> }) => {
  return getLobby(params.lobby!);
};
