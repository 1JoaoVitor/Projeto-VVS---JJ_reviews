## Comandos Úteis

```bash
# Rodar todos os testes
npm run test:ci

# Rodar apenas 1 arquivo
npx vitest run src/features/lists/services/__tests__/listsService.test.ts

# Modo observação (auto-roda quando salva)
npx vitest --watch

# Cobertura detalhada
npx vitest run --coverage

# Só testes que falharam antes
npx vitest run --reporter=verbose

# Testes E2E
npx playwright test --ui

# Mutações
npx stryker-cli run

```
