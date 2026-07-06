import { test, expect } from '@playwright/test';

test.describe('Fluxos de Navegação e Interação (E2E)', () => {

  test('deve abrir o modal de autenticação ao clicar em Criar Conta', async ({ page }) => {
    await page.goto('/');

    await page.click('button:has-text("Criar minha conta grátis")');

    await page.pause(); 

    const modalContent = page.locator('.modal-content').first();
    
    await expect(modalContent).toBeVisible({ timeout: 10000 });
  });

  test('deve navegar corretamente para a central de Jogos', async ({ page }) => {
    await page.goto('/jogos');
    const tituloJogo = page.locator('text="Modo Batalha"').first();
    await expect(tituloJogo).toBeVisible();
  });

  test('deve redirecionar URLs antigas para as novas rotas corretas (Fallback & Redirect)', async ({ page }) => {
    await page.goto('/batalha');

    await expect(page).toHaveURL(/.*\/jogos/);

    await page.goto('/diary');

    await expect(page).toHaveURL(/.*\/social/);
  });

  test('deve renderizar a grade completa de features na Landing Page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h3:has-text("Avalie e Critique")')).toBeVisible();
    await expect(page.locator('h3:has-text("Sua Watchlist")')).toBeVisible();
    await expect(page.locator('h3:has-text("Modo Batalha")')).toBeVisible();
    
    const cards = page.locator('h3'); 
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(5); 
  });

  test('deve possuir os meta-dados e título corretos para SEO', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*JJ Reviews.*/i);
  });

  test('deve fazer login com usuário real no Supabase e carregar ambiente autenticado', async ({ page }) => {
    
    await page.goto('/');

    await page.click('button:has-text("Criar minha conta grátis")');

    const modalContent = page.locator('.modal-content').first();
    
    await expect(modalContent).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Ex: usuario_reviews99 ou email@exemplo.com').fill('snowlandpolar@gmail.com');
    
    await page.fill('input[type="password"]', 'SENHA');

    await modalContent.locator('button[type="submit"]').click({ force: true });

    await expect(modalContent).toBeHidden({ timeout: 15000 });

    const btnAdicionarFilme = page.locator('button', { hasText: '+ Adicionar Filme' }).first();

    await expect(btnAdicionarFilme).toBeVisible({ timeout: 15000 });
    
  });

  test('deve fazer o ciclo completo de login e logout destruindo a sessão com segurança', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Criar minha conta grátis")');
    
    const modalContent = page.locator('.modal-content').first();
    await expect(modalContent).toBeVisible({ timeout: 10000 });

    await modalContent.getByPlaceholder('Ex: usuario_reviews99 ou email@exemplo.com').fill('snowlandpolar@gmail.com');
    await modalContent.locator('input[type="password"]').fill('SENHA'); 
    await modalContent.locator('button[type="submit"]').click({ force: true });

    await expect(modalContent).toBeHidden({ timeout: 15000 });

    const btnAdicionarFilme = page.locator('button', { hasText: '+ Adicionar Filme' }).first();
    await expect(btnAdicionarFilme).toBeVisible({ timeout: 10000 });

    const btnSairNavbar = page.locator('text="Sair"').first();
    await btnSairNavbar.click({ force: true });

    const modalConfirmacao = page.locator('.modal-content').first();
    await expect(modalConfirmacao).toBeVisible();

    await modalConfirmacao.locator('button', { hasText: 'Sim, sair' }).click();

    await expect(btnAdicionarFilme).toBeHidden({ timeout: 10000 });
    
    const btnLandingPage = page.locator('button:has-text("Criar minha conta grátis")').first();
    await expect(btnLandingPage).toBeVisible();
  });
});