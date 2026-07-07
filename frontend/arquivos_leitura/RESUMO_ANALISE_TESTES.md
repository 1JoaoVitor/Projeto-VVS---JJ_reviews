# Resumo dos Testes

Este documento resume a suíte de testes atual do frontend do JJ Reviews.

## 1. Visão Geral

- 3 arquivos E2E em `frontend/tests`
- 49 arquivos de teste ligados às features em `src/features`
- 541 casos de teste no total, somando unit, integração e E2E

## 2. Onde Cada Tipo de Teste Está

### E2E

Os testes end to end estão na pasta `frontend/tests`:

- `landing.spec.ts`
- `flows.spec.ts`
- `example.spec.ts`

A configuração está em `frontend/playwright.config.ts`, com `testDir: './tests'`, `baseURL` local e execução em múltiplos browsers.

Esses testes validam o app no navegador real, com rotas e interações reais. Eles cobrem fluxo de entrada, navegação, redirecionamentos e leitura de título/meta.

### Unit

Os testes unitários ficam principalmente nas pastas de cada feature, em especial:

- `logic/__tests__`
- `utils/__tests__`

Exemplos claros:

- `src/features/movies/logic/__tests__/filterMovies.test.ts`
- `src/features/share/logic/__tests__/shareOperations.test.ts`
- `src/features/import/utils/__tests__/csvParser.test.ts`

Esses testes exercitam funções puras, com entradas e saídas controladas, sem depender de UI ou de uma base de dados real.

### Integração

Os testes de integração leve estão nas features, principalmente em:

- `services/__tests__`
- `hooks/__tests__`
- `components/**/__tests__`

Exemplos:

- `src/features/lists/services/__tests__/listsService.test.ts`
- `src/features/lists/hooks/__tests__/useListSocial.test.ts`
- `src/features/lists/components/ListDetails/__tests__/ListDetails.test.tsx`
- `src/features/movies/components/AddMovieModal/__tests__/AddMovieModal.test.tsx`

Esses testes validam colaboração entre camadas: componente + hook + service, ou service + cliente mockado, ou UI + eventos.

## 3. Distribuição Atual

Pela varredura da árvore atual do frontend:

- E2E: 3 arquivos em `frontend/tests`
- Testes de feature: 54 arquivos em `frontend/src/features`

Separando por categoria de pirâmide:

- unitários: 24 arquivos e 272 casos de teste
- integração: 30 arquivos e 261 casos de teste
- E2E: 3 arquivos e 10 casos de teste

Dentro dos testes de feature, a distribuição observada é:

- lógica pura em `logic`: forte presença de testes unitários
- parsing e utilitários em `utils`: unitários puros
- `services`: testes de integração leve com mocks de Supabase/APIs
- `hooks`: testes de integração de estado e orquestração
- `components`: testes de integração da UI com serviços mockados

Há um caso híbrido em `src/features/games/components/GamesHub`, onde alguns testes de `logic` e `services` ficam fisicamente dentro de uma árvore de componente. Mesmo assim, pelo conteúdo, eles continuam testando lógica isolada ou persistência de apoio.

## 4. Forma Real da Suíte

### Base Funcional: Unit

Ela cobre funções como:

- filtros e ordenação de filmes
- transformação de dados
- validação de entrada
- regras de negócio pequenas e determinísticas

### Integração Como Borda de Orquestração

- hooks que orquestram estado e chamadas;
- componentes que disparam ações reais, mas com dependências controladas;
- fluxos que validam colaboração entre camadas.

### E2E

Existe, mas ainda é pequeno.

- a aplicação sobe;
- rotas principais respondem;
- landing page e navegação básica funcionam;
- a experiência mínima do usuário não quebrou.



## 5. Leitura Pela Pirâmide


```text
        E2E
   poucos testes, mas reais
-----------------------------
     Integração de fluxo
 hooks, componentes e poucos serviços críticos
-----------------------------
          Unit
 lógica pura, utilitários e services simples
```


```text
      E2E
   3 arquivos / 10 casos
-----------------------------
    Integração de fluxo
 30 arquivos / 261 casos
-----------------------------
        Unit
 24 arquivos / 272 casos
```
