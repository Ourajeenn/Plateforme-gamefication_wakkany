import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('le préchargement est sans image et la navigation se compacte au scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const startButton = page.getByRole('button', { name: 'START' });
  await expect(startButton).toBeVisible();
  await expect(startButton).toBeEnabled();
  await expect(page.locator('#root img')).toHaveCount(0);

  await startButton.click({ force: true });
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await expect(navigation).toBeVisible({ timeout: 20000 });
  const installButton = page.getByRole('button', { name: /Installer l'application/ }).first();
  await expect(installButton).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: 60, behavior: 'instant' }));
  await expect.poll(() => navigation.evaluate((element) => element.style.getPropertyValue('--nav-height'))).toBe('84px');

  await page.evaluate(() => window.scrollTo({ top: 120, behavior: 'instant' }));
  await expect.poll(() => navigation.evaluate((element) => element.parentElement.classList.contains('is-scrolled'))).toBe(true);
  await expect.poll(() => navigation.evaluate((element) => element.style.getPropertyValue('--nav-height'))).toBe('72px');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => navigation.evaluate((element) => element.style.getPropertyValue('--nav-height'))).toBe('96px');
  await expect.poll(() => navigation.evaluate((element) => element.parentElement.classList.contains('is-scrolled'))).toBe(false);

  await installButton.click();
  await expect(page.getByText('Ouvrez le menu de votre navigateur et choisissez « Installer Wakkany ».')).toBeVisible();
});

test('le manifeste PWA et ses icônes sont disponibles sur mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute('href', /manifest\.webmanifest/);
  const manifest = await page.evaluate(async () => {
    const response = await fetch(document.querySelector('link[rel="manifest"]').href);
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    return response.json();
  });
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBeTruthy();
  expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBeTruthy();
  for (const iconPath of ['/icon-192.png', '/icon-512.png']) {
    const iconResponse = await page.request.get(`${page.url().split('/').slice(0, 3).join('/')}${iconPath}`);
    expect(iconResponse.ok()).toBeTruthy();
  }
});

test('la rangée des alliés affiche tous les champions fantasy', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const startButton = page.getByRole('button', { name: 'START' });
  await expect(startButton).toBeEnabled();
  await startButton.click();

  const roster = page.getByLabel('Champions de la Covenant');
  await roster.scrollIntoViewIfNeeded();
  const champions = roster.getByRole('button', { name: /champion/ });
  await expect(champions).toHaveCount(16);
  await expect(roster.getByRole('button', { name: /Panthère Mage/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(roster.getByText('Singe Stratège')).toBeVisible();
  await expect(roster.getByText('Guenon du Thé')).toBeVisible();

  await roster.getByRole('button', { name: /Tigre Berserker/ }).hover();
  await expect(page.getByTestId('selected-champion-name')).toHaveText('Tigre Berserker');

  await roster.getByRole('button', { name: /Tigre Berserker/ }).click();
  await expect(roster.getByRole('button', { name: /Tigre Berserker/ })).toHaveAttribute('aria-pressed', 'true');
});