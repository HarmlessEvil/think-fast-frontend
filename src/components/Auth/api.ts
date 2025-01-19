import { request } from '../../api/client.ts';

export const login = async (body: { username: string }): Promise<Record<never, never>> =>
  request('login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
