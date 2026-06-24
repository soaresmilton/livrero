# Livrero

## Visão do Produto

Livrero é uma plataforma de gestão da vida de leitura pessoal ("Personal Reading OS").

O objetivo não é ser apenas um CRUD de livros, mas uma experiência digital focada em:

- organização da biblioteca pessoal;
- construção do hábito de leitura;
- acompanhamento de progresso;
- registro de sessões de leitura;
- escrita de anotações e reflexões em Markdown;
- visualização de métricas e insights;
- preparação arquitetural para funcionalidades sociais, IA e monetização.

O conceito central do produto é:

> Digital Sanctuary

O sistema deve transmitir a sensação de um ambiente silencioso, acolhedor e focado, semelhante a um pequeno refúgio de leitura.

O usuário deve sentir:

- calma;
- foco;
- clareza;
- baixa carga cognitiva;
- prazer em organizar sua vida literária.

A interface nunca deve parecer uma ferramenta corporativa ou um dashboard de produtividade agressivo.

---

# Princípios de Produto

## Simplicidade

Preferir:

- poucos elementos;
- hierarquia visual forte;
- bastante espaço em branco;
- interações óbvias.

Evitar:

- excesso de informações;
- excesso de indicadores;
- gamificação infantil;
- interfaces visualmente poluídas.

---

## Conteúdo Primeiro

Livros, capas e anotações são o centro da experiência.

A interface existe para servir o conteúdo.

O design deve desaparecer e permitir que o conteúdo se destaque.

---

## Progressão Incremental

O produto será construído em múltiplas versões.

A prioridade é:

V0 → Utilidade pessoal sólida
V1 → Produto utilizável por terceiros
V2 → Recursos sociais
V3 → Recursos de IA
V4 → Monetização

Nunca implementar funcionalidades futuras antecipadamente.

Porém, a arquitetura deve permanecer preparada para evolução.

---

# Stack Inicial

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Zustand

## Backend

- Python
- FastAPI
- Pydantic v2
- SQLAlchemy 2.0
- Alembic
- Pytest

## Banco de Dados

- PostgreSQL

## Infraestrutura

- Docker
- Docker Compose
- GitHub Actions

---

# Diretrizes Arquiteturais

## Estilo arquitetural

Aplicação modular monolítica.

Não utilizar microserviços.

Separar claramente:

- domínio;
- aplicação;
- infraestrutura;
- apresentação.

A arquitetura deve permitir extração de serviços futuramente, mas não otimizar prematuramente para isso.

---

# Backend Structure

app/
├── api/
├── domain/
│   ├── entities/
│   ├── value_objects/
│   ├── repositories/
│   └── services/
├── application/
│   ├── use_cases/
│   ├── dto/
│   └── services/
├── infrastructure/
│   ├── persistence/
│   ├── integrations/
│   └── config/
├── shared/
└── tests/

---

# Frontend Structure

src/
├── app/
├── pages/
├── features/
│   ├── auth/
│   ├── books/
│   ├── reading-sessions/
│   ├── notes/
│   ├── dashboard/
│   └── goals/
├── components/
├── hooks/
├── services/
├── store/
├── types/
└── utils/

A organização deve ser orientada por features e não exclusivamente por camadas.

---

# Filosofia de Desenvolvimento

Antes de escrever código:

1. Entender o problema.
2. Modelar o domínio.
3. Identificar entidades.
4. Identificar agregados.
5. Definir contratos.
6. Definir casos de uso.
7. Somente então implementar.

Não gerar código imediatamente.

Sempre começar pelo design da solução.

---

# Modelo de Domínio Inicial

## User

Responsável por:

- autenticação;
- preferências;
- temas;
- metas.

Campos iniciais:

- id
- name
- email
- password_hash
- theme
- created_at

---

## Book

Representa um livro da biblioteca do usuário.

Campos iniciais:

- id
- user_id
- title
- author
- description
- genre
- edition
- publisher
- publish_year
- cover_url
- isbn
- total_pages
- status
- created_at

Status:

- WANT_TO_READ
- READING
- COMPLETED
- ABANDONED

---

## ReadingSession

Entidade mais importante do sistema.

Toda métrica de leitura nasce daqui.

Campos:

- id
- user_id
- book_id
- started_at
- finished_at
- starting_page
- ending_page
- pages_read
- minutes_read
- notes

---

## ReadingNote

Campos:

- id
- user_id
- book_id
- title
- content_markdown
- created_at
- updated_at

---

## ReadingGoal

Campos:

- id
- user_id
- year
- books_goal
- pages_goal
- minutes_goal

---

# Regras Importantes

Não persistir:

- streak;
- horas totais;
- livros lidos;
- páginas totais.

Essas informações são derivadas de ReadingSession.

Persistir apenas dados essenciais.

---

# Funcionalidades V0

## Autenticação

- cadastro
- login
- logout
- refresh token
- recuperação de senha
- dark mode
- light mode

---

## Dashboard

Painel inicial após login.

Exibir:

- livro atual;
- livros concluídos;
- horas lidas;
- páginas lidas;
- streak;
- metas;
- gráfico de hábito de leitura.

O gráfico de hábito deve ser inspirado no contribution graph do GitHub.

A intensidade de cor deve representar volume de leitura diário.

---

## Biblioteca

Funcionalidades:

- adicionar livro;
- editar livro;
- remover livro;
- pesquisar;
- filtrar;
- mudar status;
- exibir progresso de leitura;
- exibir detalhes.

---

## Sessões de Leitura

Funcionalidades:

- iniciar sessão;
- encerrar sessão;
- registrar páginas;
- registrar duração;
- histórico de sessões;
- cálculo de progresso.

---

## Notas

Funcionalidades:

- editor Markdown;
- preview;
- busca;
- organização por livro;
- edição;
- exclusão.

---

# Evoluções Futuras (não implementar agora)

## IA

Possibilidades futuras:

- resumo de capítulos;
- perguntas sobre anotações;
- flashcards;
- recomendações;
- busca semântica.

Projetar o código para permitir integrações futuras.

Não criar código de IA nesta versão.

---

## Social

Possibilidades futuras:

- feed;
- compartilhamento;
- seguidores;
- comentários;
- reações.

Não implementar agora.

---

## Monetização

Possibilidades futuras:

- Stripe;
- AbacatePay;
- assinatura premium;
- feature flags;
- planos.

Preparar o domínio para isso.

Não implementar agora.

---

# Design System

O design system já está definido e deve ser considerado fonte de verdade. :contentReference[oaicite:0]{index=0}

Conceito:

Digital Sanctuary

A estética mistura:

- minimalismo;
- editorial moderno;
- sensação de refúgio de leitura;
- baixa carga cognitiva.

A interface deve parecer:

- elegante;
- calma;
- literária;
- respirável.

Nunca utilizar:

- gradientes agressivos;
- cores saturadas;
- excesso de animações;
- elementos visuais chamativos.

---

# Paleta

Primary:
Sage Green

Secondary:
Terracotta

Background:
Warm Paper

Dark Mode:
Charcoal profundo.

As cores devem respeitar integralmente os tokens definidos no design system.

---

# Tipografia

Headlines:
Source Serif 4

Textos e UI:
Hanken Grotesk

Evitar:

- excesso de negrito;
- textos em caixa alta;
- densidade excessiva.

---

# Layout

Desktop:

- grid de 12 colunas;
- largura máxima de 1280px;
- gutters de 24px.

Todo espaçamento deve seguir múltiplos de 8px.

Usar grandes áreas de respiro entre seções.

---

# Componentes Centrais

Book Card:
Componente principal do sistema.

Deve conter:

- capa;
- título;
- autor;
- status;
- progresso.

Reading Heatmap:
Inspirado no GitHub.

Reading Session Timer:
Experiência de foco e acompanhamento.

Markdown Notes:
Experiência semelhante a um editor de escrita limpa.

---

# Qualidade de Código

Obrigatório:

- TypeScript strict mode;
- tipagem explícita;
- lint;
- formatter;
- testes unitários;
- testes de integração;
- migrations versionadas;
- Docker funcionando desde o primeiro commit.

---

# Processo de Trabalho do Agente

Para cada funcionalidade:

1. Entender requisitos.
2. Fazer perguntas quando houver ambiguidades.
3. Produzir proposta arquitetural.
4. Modelar domínio.
5. Definir contratos.
6. Identificar impactos.
7. Criar plano de implementação.
8. Implementar incrementalmente.
9. Criar testes.
10. Atualizar documentação.

Nunca:

- assumir requisitos;
- gerar grandes quantidades de código sem planejamento;
- criar abstrações desnecessárias;
- introduzir complexidade prematura;
- ignorar o design system.

Atue como um engenheiro de software sênior responsável por evoluir o Livrero de forma incremental, sustentável e preparada para crescimento futuro.