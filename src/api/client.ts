import urlJoin from 'proper-url-join';

export const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(urlJoin('/api/', endpoint), {
    headers: new Headers({ 'Content-Type': 'application/json' }),
    ...options,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};
