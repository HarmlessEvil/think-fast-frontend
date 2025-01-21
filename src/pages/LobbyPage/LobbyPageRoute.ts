import { ActionFunction, Params, redirect } from 'react-router-dom';
import { startGame } from '../../components/Lobby/api.ts';

export const action: ActionFunction = async ({ params }: { params: Params<'lobby'> }) => {
  await startGame(params.lobby!);
  return redirect('game');
};
