import { test, expect } from '@playwright/test';

async function openQuizPath(page, url) {
  await page.goto(url);
  const startButton = page.getByRole('button', { name: 'START' });
  if (await startButton.isVisible()) {
    await expect(startButton).toBeEnabled();
    await startButton.click({ force: true });
    await expect(startButton).toHaveCount(0);
  }
}

test('le choix solo ouvre une configuration sans mode multijoueur', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openQuizPath(page, '/quiz/modes');

  await expect(page.getByRole('heading', { name: 'Réseau local' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'En ligne' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Solo' })).toBeVisible();
  const pageWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(pageWidths.content).toBeLessThanOrEqual(pageWidths.viewport);

  await page.getByRole('button', { name: 'Choisir une épreuve' }).click();
  await expect(page.getByRole('heading', { name: 'CONFIGURATION DU DÉFI SOLO' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Coop Meute' })).toHaveCount(0);
});

test('un joueur rejoint un salon sur le réseau local avec son code', async ({ browser, baseURL }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  try {
    await openQuizPath(hostPage, `${baseURL}/quiz/host?network=local`);
    await hostPage.getByPlaceholder('Chasseur légendaire...').fill('Hote LAN');

    const createButton = hostPage.getByRole('button', { name: /Créer la salle/ });
    await expect(createButton).toBeEnabled({ timeout: 15000 });
    await createButton.click();

    const roomCodeButton = hostPage.getByTitle('Copier le code');
    await expect(roomCodeButton).toBeVisible();
    const roomCode = (await roomCodeButton.locator('span').first().textContent()).trim();
    expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);

    await openQuizPath(guestPage, `${baseURL}/quiz/join?network=local`);
    await guestPage.getByPlaceholder('AB3K9Z').fill(roomCode);
    await guestPage.getByPlaceholder('Chasseur légendaire…').fill('Invite LAN');
    const joinButton = guestPage.getByRole('button', { name: /Rejoindre/ });
    await expect(joinButton).toBeEnabled({ timeout: 15000 });
    await joinButton.click();

    await expect(hostPage.getByText('2 / 8')).toBeVisible({ timeout: 10000 });
    await expect(guestPage.getByText('Hote LAN')).toBeVisible();
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});