import { ActionFunction, redirect } from 'react-router-dom';
import { login } from '../../components/Auth/api.ts';
import { schema } from '../../components/Auth/LoginSchema.ts';

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
