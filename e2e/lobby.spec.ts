import { expect, test } from '@playwright/test';

test('user can login and see the lobby', async ({ baseURL, page }) => {
  let me: { username: string } | null = null;
  await page.route('/api/lobby', (route) => {
    if (me === null) {
      return route.fulfill({
        contentType: 'text/plain',
        status: 401,
      });
    }

    return route.fulfill({
      json: {
        lobbyID: 'test-lobby',
      },
    });
  });

  await page.route('/api/login', (route) => {
    me = route.request().postDataJSON();
    return route.fulfill({
      json: {},
    });
  });

  await page.route('/api/me', (route) => {
    if (me === null) {
      return route.fulfill({
        contentType: 'text/plain',
        status: 401,
      });
    }

    return route.fulfill({
      json: me,
    });
  });

  await page.route('/api/lobby/test-lobby', (route) => {
    return route.fulfill({
      json: {
        players: {},
      },
    });
  });

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
});
