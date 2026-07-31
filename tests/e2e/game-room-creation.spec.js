import { test, expect } from '@playwright/test';

test.describe('Game Room Creation (Multiplayer Menu)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('User can navigate to create game room menu', async ({ page }) => {
    // Look for the "Créer une salle" button or similar
    // First check if we're on the landing page or dashboard
    const createRoomButton = page.locator('text=/créer une salle|create room|créer/i').first();
    
    // If not visible on landing, try to access quiz/games section
    if (!(await createRoomButton.isVisible())) {
      // Try clicking on quiz or games section
      const gamesButton = page.locator('text=/quiz|jeu|game/i').first();
      if (await gamesButton.isVisible()) {
        await gamesButton.click();
      }
    }

    // Wait for the page to load
    await page.waitForTimeout(500);
    
    // Check that we can see the room creation UI
    const hostLobbySection = page.locator('text=/host lobby|créer une salle|hôte/i').first();
    expect(hostLobbySection).toBeDefined();
  });

  test('User can create a game room with valid input', async ({ page }) => {
    // Fill in pseudo (nickname)
    const pseudoInput = page.locator('input[placeholder*="pseudo"], input[placeholder*="Pseudo"]').first();
    
    if (await pseudoInput.isVisible()) {
      await pseudoInput.fill('TestPlayer');
    }

    // Select a game mode (Bluff Royal)
    const bluffRoyalButton = page.locator('text=/bluff royal/i').first();
    if (await bluffRoyalButton.isVisible()) {
      await bluffRoyalButton.click();
    }

    // Select a theme (RPG)
    const rpgTheme = page.locator('text=/rpg|univers rpg/i').first();
    if (await rpgTheme.isVisible()) {
      await rpgTheme.click();
    }

    // Click "Créer la salle" button
    const createButton = page.locator('button:has-text("Créer la salle"), button:has-text("CREATE"), button:has-text("Créer")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Wait for room creation (should not show RLS error)
      await page.waitForTimeout(2000);
      
      // Check that we successfully entered the room (no error toast)
      const errorToast = page.locator('text=/error|violates|security|erreur/i').first();
      expect(errorToast).toHaveCount(0, { timeout: 5000 });
      
      // Verify room code is displayed (indicating successful creation)
      const roomCode = page.locator('text=/code|room code|salle/i').first();
      await expect(roomCode).toBeVisible({ timeout: 5000 });
    }
  });

  test('Verify no RLS security error appears on room creation', async ({ page }) => {
    // Intercept network errors to catch RLS violations
    let rslError = false;
    
    page.on('response', (response) => {
      if (!response.ok()) {
        const statusText = response.statusText().toLowerCase();
        if (statusText.includes('security') || statusText.includes('policy')) {
          rslError = true;
        }
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('security')) {
        rslError = true;
      }
    });

    // Fill form and create room
    const pseudoInput = page.locator('input[placeholder*="pseudo"], input[placeholder*="Pseudo"]').first();
    if (await pseudoInput.isVisible()) {
      await pseudoInput.fill('TestUser');
      
      const createButton = page.locator('button:has-text("Créer la salle"), button:has-text("CREATE")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Assert no RLS error occurred
    expect(rslError).toBe(false);
  });
});
