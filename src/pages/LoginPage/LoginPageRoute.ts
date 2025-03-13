import { ActionFunction, redirect } from 'react-router-dom';
import { login, meQueryOptions } from '../../components/auth/api.ts';
import { schema } from '../../components/auth/LoginSchema.ts';
import { queryClient } from '../../api/client.ts';

const defaultRedirect = '/';

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const formData = await request.formData();
  const loginData = schema.parse(Object.fromEntries(formData));

  await login(loginData);

  const url = new URL(request.url);

  const dest = url.searchParams.get('redirect') ?? defaultRedirect;
  const relativeDest = dest.startsWith('/') ? dest : defaultRedirect;
  const safeDest = relativeDest === url.pathname ? defaultRedirect : relativeDest;

  return redirect(safeDest);
};

/**
 * Fetch current user. If user is logged in, redirect to the main page. Otherwise, proceed to show a login form.
 */
export const loader = async () => {
  try {
    await queryClient.fetchQuery(meQueryOptions);
    return redirect('/');
  } catch {
    return null;
  }
};
