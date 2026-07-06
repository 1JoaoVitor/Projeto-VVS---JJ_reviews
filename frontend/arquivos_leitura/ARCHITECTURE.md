# Arquitetura Frontend - JJ Reviews

Este documento resume as decisões arquiteturais do frontend e serve como referência para mudanças novas ou refatorações.

## Objetivo

- Manter regras de negócio previsíveis e testáveis.
- Isolar side effects para reduzir regressões.
- Evoluir features com o mesmo padrão de estrutura e testes.

## Stack Principal

- React + TypeScript + Vite
- Vitest + Testing Library
- Supabase para auth, banco, storage e realtime
- Capacitor para empacotamento mobile

## Princípios

1. Estrutura por feature.
- Cada domínio vive em `src/features/<feature>`.
- A API pública da feature é exposta por `index.ts`.

2. Padrão FC/IS.
- `logic` concentra regras puras.
- `services`, `hooks` e `components` formam a "casca imperativa".

3. Fronteiras explícitas.
- `components`: render e interação.
- `hooks`: estado, efeitos e orquestração.
- `services`: IO externo, APIs e persistência.
- `logic`: validação, transformação e decisão de negócio.

4. Acoplamento mínimo.
- Evita imports diretos entre features.
- Compartilha código apenas por contratos claros em `types`, `utils` e `lib`.

## Estrutura

```text
src/features/<feature>/
  components/
  hooks/
  logic/
  services/
  index.ts
```

## Regras por Camada

### Logic

- Deve ser determinístico e sem side effects.
- Não deve usar Supabase, `fetch`, DOM, `window` ou `localStorage`.
- Deve ter testes unitários cobrindo branches relevantes.

### Services

- Toda chamada externa deve ficar aqui.
- Cada função precisa de contrato claro de entrada e saída.
- Erros devem ser propagados de forma consistente.
- Testes mínimos: sucesso, vazio/null e erro.

### Hooks

- Coordenam estado, efeitos e chamadas de `logic` ou `services`.
- Se o hook começa a acumular regra, a regra deve sair para `logic`.

### Components

- Não chamam Supabase, `fetch` ou `axios` diretamente.
- Não devem concentrar regra de negócio pesada no JSX.
- Devem consumir contratos estáveis da feature.

## Política de Testes

1. `logic`.
- Foco em regra e branches.
- Preferência por testes puros, sem mocks de framework.

2. `services`.
- Mock da borda externa.
- Cobrir sucesso, ausência de dados e erro.

3. Integração de UI.
- Cobrir fluxos críticos de usuário.
- Incluir pelo menos um caminho negativo por fluxo principal.

4. Cobertura.
- Prioridade para `logic`, `services` e hooks críticos.
- A meta deve acompanhar o risco real da feature, não o tamanho do arquivo.

## Fluxo de Novas Features

O passo a passo completo está em [FEATURE_PLAYBOOK.md](FEATURE_PLAYBOOK.md).
Use esse playbook como regra operacional para qualquer feature nova.

## Evolução da Arquitetura

- Se um service crescer demais, separe por caso de uso.
- Se um hook acumular regra, extraia para `logic`.
- Se houver acoplamento entre features, crie um contrato explícito de domínio.
- Se a UI depender de muito estado local, reavalie a divisão em subcomponentes.

## Critério de Aceite

Uma mudança arquitetural é aceitável quando:

- respeita FC/IS,
- preserva fronteiras claras,
- tem cobertura proporcional ao risco,
- e não cria acoplamento desnecessário.
