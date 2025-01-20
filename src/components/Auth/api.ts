import { UseQueryOptions } from '@tanstack/react-query';
import { request } from '../../api/client.ts';

export const me = async (): Promise<{
  id: string
  username: string
}> => request('me');

export const meQueryOptions: UseQueryOptions<
  Awaited<ReturnType<typeof me>>,
  Error,
  Awaited<ReturnType<typeof me>>,
  ['me']
> = {
  queryFn: me,
  queryKey: ['me'],
  staleTime: 1000 * 60 * 60,
};

export const login = async (body: { username: string }): Promise<Record<never, never>> =>
  request('login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
