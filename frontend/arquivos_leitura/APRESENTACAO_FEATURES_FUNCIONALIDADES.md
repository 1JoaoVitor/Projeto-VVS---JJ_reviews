# Apresentação das Features e Funcionalidades do JJ Reviews

Este documento resume, em linguagem de apresentação, as principais features e funcionalidades do frontend do JJ Reviews. A ideia é servir como roteiro para explicar o sistema de ponta a ponta.

## 1. Visão Geral do Produto

O JJ Reviews é uma aplicação web para organizar a experiência de filmes com foco em:

- catálogo pessoal de filmes assistidos e em watchlist;
- listas de filmes com colaboração e compartilhamento;
- socialização com amigos;
- recomendações personalizadas;
- importação de dados externos;
- jogos e experiências interativas;
- perfil público e páginas de apoio.

Na prática, o app combina organização pessoal, elementos sociais e recursos de descoberta de conteúdo.

## 2. Navegação e Estrutura da Aplicação

A aplicação possui uma navegação principal com rotas dedicadas para as áreas centrais:

- tela inicial e acesso à plataforma;
- área principal de filmes;
- área social;
- área de recomendações;
- área de jogos;
- listas;
- perfil do usuário;
- perfil público;
- importação de dados;
- suporte.

Também há elementos de apoio ao uso:

- navbar principal;
- navegação inferior em mobile;
- botão de instalação da aplicação;
- toasts de feedback;
- modais de confirmação, login, edição e detalhes.

## 3. Autenticação e Conta

### Login e recuperação de senha

A feature de autenticação cobre o acesso do usuário ao sistema com:

- abertura de modal de login;
- autenticação na aplicação;
- redefinição de senha;
- controle de sessão;
- logout com confirmação.

### Perfil do usuário

A área de perfil permite:

- visualizar dados da conta;
- atualizar nome de usuário;
- gerenciar avatar;
- acessar informações pessoais associadas ao usuário.

### Perfil público

O sistema também oferece uma página pública por username, permitindo:

- visualizar informações públicas de um usuário;
- expor parte da presença social do perfil;
- compartilhar a identidade dentro da aplicação.

## 4. Catálogo de Filmes

A área de filmes é uma das principais do projeto e concentra o uso diário da aplicação.

### Organização da biblioteca pessoal

O usuário pode:

- visualizar filmes assistidos;
- manter uma watchlist;
- alternar entre modos de exibição;
- abrir detalhes de um filme;
- adicionar novos filmes;
- editar informações de filmes;
- excluir filmes com confirmação;
- carregar a lista com estados de loading e skeletons.

### Busca e filtros

A visualização de filmes inclui filtros e refinamentos como:

- busca por texto;
- ordenação;
- filtro por gênero;
- filtro por nacionalidade;
- filtro por filmes Oscar;
- filtro por diretor;
- filtro por conteúdo internacional;
- alternância entre assistidos, watchlist e listas.

### Experiência de visualização

O app também organiza a apresentação do catálogo com:

- cards de filmes;
- modal de detalhes do filme;
- estados vazios;
- indicadores de contagem de itens exibidos.

## 5. Listas de Filmes

A feature de listas amplia o catálogo pessoal para coleções organizadas e compartilháveis.

### Criação e edição

O usuário pode:

- criar listas;
- editar listas existentes;
- excluir listas;
- duplicar listas;
- abrir detalhes de uma lista;
- navegar entre visão geral e detalhe.

### Colaboração e compartilhamento

As listas suportam colaboração e interação social com:

- compartilhamento com amigos;
- listas privadas, parciais e unificadas;
- convite de colaboradores;
- aceite e recusa de convites;
- remoção de colaboradores;
- notificação de convites;
- visualização de curtidas.

### Interação com conteúdo

Dentro das listas, o sistema permite:

- adicionar filmes a uma lista;
- remover filmes de uma lista;
- ver se um filme já existe na lista;
- visualizar reviews associados à lista;
- ver o dono e os colaboradores da lista.

## 6. Área Social

A camada social conecta o usuário com outras pessoas dentro do app.

### Amigos

A feature de amigos cobre:

- abertura do modal de amigos;
- gestão de amizade;
- relacionamento entre usuários;
- base para recursos sociais dentro da plataforma.

### Diário social

A área social exibe uma linha do tempo de atividades com:

- atividades recentes de amigos;
- relações com filmes assistidos;
- leitura social do histórico do usuário;
- acesso pela rota social.

### Notificações

O sistema inclui um centro de notificações para:

- receber avisos em tempo real;
- sinalizar interações sociais;
- acompanhar convites e ações importantes;
- marcar notificações como lidas.

### Compartilhamento

A aplicação também oferece recursos de compartilhamento como:

- card de compartilhamento;
- modal de compartilhamento;
- apoio à difusão de listas e conteúdo social.

## 7. Recomendações

A área de recomendações ajuda o usuário a descobrir novos filmes.

Ela oferece:

- recomendações personalizadas;
- leitura do histórico do usuário;
- integração com os filmes já cadastrados;
- tela própria de recomendações;
- abertura do detalhe do filme sugerido.

## 8. Importação de Dados

A feature de importação é uma das mais completas do projeto e serve para trazer dados externos para dentro da plataforma.

### Arquivos suportados

O sistema processa dados como:

- profile;
- ratings;
- reviews;
- watched;
- watchlist;
- list.

### Funcionalidades da importação

O fluxo de importação inclui:

- extração de arquivos compactados;
- detecção do conteúdo importado;
- parsing de CSV;
- validação de dados;
- transformação dos dados para o formato interno;
- simulação de importação antes da gravação real;
- persistência final dos dados importados.

### Valor para o usuário

Isso permite:

- migrar dados de outras plataformas;
- reaproveitar histórico já existente;
- reduzir trabalho manual de cadastro;
- acelerar o onboarding de novos usuários.

## 9. Jogos e Experiências Interativas

A área de jogos amplia o app para além do gerenciamento de catálogo.

### Games Hub

O hub de jogos centraliza experiências como:

- modos de jogo diferentes;
- configuração da fonte de filmes;
- ajuda contextual;
- seleção de modo;
- visões específicas para cada experiência.

### Movie Battle

O combate entre filmes permite:

- comparar filmes em formato de batalha;
- criar uma experiência competitiva e divertida;
- usar o catálogo existente como base para o jogo.

### Daily Movie Game

O jogo diário adiciona uma dinâmica recorrente com:

- dicas progressivas;
- histórico de palpites;
- revelação final;
- controles de rodada;
- painel de fonte diária.

### Roulette

A roleta de filmes oferece:

- sorteio aleatório;
- apoio à decisão do que assistir;
- recurso leve e rápido para descoberta.

## 10. Dashboard e Visão Rápida

A dashboard funciona como resumo visual do catálogo.

Ela ajuda o usuário a:

- enxergar o estado geral da biblioteca;
- acessar atalhos de filtro;
- encontrar rapidamente um recorte da coleção;
- entrar na navegação principal do app.

## 11. Recursos de Apoio

Além das features principais, o projeto inclui vários recursos de suporte à experiência:

- botão de instalação da aplicação;
- barra de navegação responsiva;
- bottom nav no mobile;
- loading overlay;
- estado vazio;
- modal de confirmação;
- rating com estrelas;
- feedback visual por toast;
- integração com notificações push.

Esses elementos não são o foco central da apresentação, mas ajudam a mostrar que a experiência foi pensada como aplicativo completo.

## 12. Resumo Para Apresentação

Se você quiser explicar o projeto de forma curta, a melhor síntese é esta:

- o JJ Reviews organiza filmes assistidos, watchlist e listas;
- permite colaboração, compartilhamento e interação social;
- oferece importação de dados externos;
- traz recomendações personalizadas;
- inclui jogos para aumentar engajamento;
- tem suporte a perfil público, notificações e experiência mobile.

Em uma frase: é uma plataforma de organização e descoberta de filmes com camada social, importação de dados e experiências interativas.
