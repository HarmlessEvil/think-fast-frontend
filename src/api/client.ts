import { QueryClient } from '@tanstack/react-query';
import urlJoin from 'proper-url-join';

export const redirectToLogin = (): never => {
  if (window.location.pathname === '/login') {
    throw new Error('Unauthenticated');
  }

  const url = new URL('/login', window.location.origin);
  url.searchParams.set('redirect', encodeURI(window.location.pathname));

  window.location.assign(url);
  throw new Error('Unauthenticated');
};

export const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(urlJoin('/api/', endpoint), {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    redirectToLogin();
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const queryClient = new QueryClient();
