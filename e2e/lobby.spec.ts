import { expect } from '@playwright/test';
import { http, HttpResponse } from 'msw';
import { test } from './fixtures';

test.describe('lobby tests', () => {
  test('user can login and see the lobby', async ({ baseURL, page, worker }) => {
    await worker.use(http.get('/api/lobby/test-lobby', () => {
      return HttpResponse.json({
        players: {},
      });
    }));

    let me: { username: string } | null = null;
    await worker.use(http.post('/api/lobby', () => me
      ? HttpResponse.json({ lobbyID: 'test-lobby' })
      : new HttpResponse(null, { status: 401 })),
    );

    await worker.use(http.post<never, typeof me>('/api/login', async ({ request }) => {
      me = await request.json();
      return HttpResponse.json({});
    }));

    await worker.use(http.get('/api/me', () => me
      ? HttpResponse.json(me)
      : new HttpResponse(null, { status: 401 }),
    ));

    await page.goto('/');

    await page.getByRole('button', { name: 'Create Lobby' }).click();
    await expect(page).toHaveURL(new RegExp(`^${baseURL}/login`));

    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Create Lobby' }).click();

    await expect(page).toHaveURL(new RegExp(`^${baseURL}/lobby`));
    await expect(page.getByText('Code:')).toBeVisible();

    await page.goto('/');

    await page.getByRole('button', { name: 'Create Lobby' }).click();
    await expect(page).toHaveURL(new RegExp(`^${baseURL}/lobby`));

    await page.waitForTimeout(5000);
  });
});
