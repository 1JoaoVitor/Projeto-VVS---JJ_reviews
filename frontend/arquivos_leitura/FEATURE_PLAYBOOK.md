# Playbook de Nova Feature

Este guia define o fluxo padrão para criar features no frontend sem quebrar a separação entre regra de negócio, IO e interface.

## Objetivo

Manter features previsíveis, fáceis de testar e com baixo acoplamento entre camadas.

## Ordem Recomendada

1. Defina os casos de uso.
- Liste caminho feliz, erro e estados vazios.
- Escreva a entrada e a saída esperada de cada caso.

2. Extraia a lógica primeiro.
- Coloque regras puras em `src/features/<feature>/logic`.
- Não use Supabase, DOM, `fetch`, `Date.now` ou side effects diretos.
- Cubra branches relevantes com testes antes de subir para a UI.

3. Centralize IO em services.
- Coloque chamadas externas em `src/features/<feature>/services`.
- Cada service deve ter contrato claro de entrada, saída e erro.
- Teste sucesso, vazio/null e falha.

4. Use hooks só para orquestração.
- Hooks controlam estado, efeitos e handlers.
- Regra de negócio complexa deve viver em `logic`.

5. Mantenha componentes focados em renderização.
- Componentes não devem chamar Supabase, `fetch` ou `axios` diretamente.
- Consuma apenas a API pública da feature via `index.ts`.

6. Valide a UI com integração.
- Cubra fluxos críticos do usuário.
- Inclua pelo menos um caminho negativo relevante.
- Mocke services na fronteira, não no miolo da regra.

## Estrutura Mínima

```text
src/features/<feature>/
  components/
  hooks/
  logic/
  services/
  index.ts
```

## Checklist de PR

- Regras de negócio estão em `logic`.
- Side effects estão em `services`.
- Hooks apenas orquestram estado e chamadas.
- Componentes não acessam cliente externo diretamente.
- `index.ts` expõe a API pública correta.
- Testes de `logic` cobrem branches principais.
- Testes de `services` cobrem sucesso, vazio/null e erro.
- Testes de integração cobrem o fluxo crítico da UI.
- `npm run test:ci` passa sem regressão.

## Definição de Pronto

Uma feature está pronta quando:

- respeita FC/IS,
- tem testes proporcionais ao risco,
- e o comportamento principal está validado por integração.
