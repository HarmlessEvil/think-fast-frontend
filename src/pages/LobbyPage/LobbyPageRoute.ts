import { ActionFunction, Params } from 'react-router-dom';
import { getLobby, startGame } from '../../components/lobby/api.ts';

export const action: ActionFunction = async ({ params }: { params: Params<'lobby'> }) => {
  await startGame(params.lobby!);
  return null;
};

export const loader = async ({ params }: { params: Params<'lobby'> }) => {
  return getLobby(params.lobby!);
};
