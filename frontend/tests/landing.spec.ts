import { test, expect } from '@playwright/test';

test.describe('Fluxo de Acesso Inicial', () => {
  test('deve exibir a Landing Page com o título principal', async ({ page }) => {
    // 1. O robô acessa a raiz do site
    await page.goto('/');

    // 2. Procura pelo título (Regra de Negócio/UI)
    const titulo = page.locator('h1');
    await expect(titulo).toContainText('Sua jornada cinematográfica');

    // 3. Verifica se o botão de criar conta está presente e visível
    const botaoCriarConta = page.locator('button', { hasText: 'Criar minha conta grátis' });
    await expect(botaoCriarConta).toBeVisible();
  });
});