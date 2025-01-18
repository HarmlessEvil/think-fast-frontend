import { request } from '../../api/client.ts';

export const login = async (body: { username: string }) =>
  request('login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
