# Livrero - Product Roadmap

## Visão

Livrero é uma plataforma para gerenciamento da vida de leitura pessoal, construída sobre o conceito de "Digital Sanctuary".

O objetivo inicial é criar uma ferramenta extremamente útil para uso pessoal, evoluindo gradualmente para uma plataforma comercial com funcionalidades sociais, inteligência artificial e monetização.

---

# Princípios

* Simplicidade antes de complexidade
* Conteúdo antes de interface
* Arquitetura preparada para evolução
* Incrementos pequenos e entregáveis
* Não otimizar prematuramente

---

# Situação Atual

Status: Planejamento Inicial

Stack:

Frontend:

* React
* TypeScript
* Tailwind
* TanStack Query
* Zustand
* React Hook Form
* Zod

Backend:

* FastAPI
* SQLAlchemy 2.0
* Pydantic v2
* Alembic
* Pytest

Infra:

* Docker
* Docker Compose
* GitHub Actions

Banco:

* PostgreSQL

---

# Milestone 0 - Foundation

Objetivo:

Criar uma fundação de engenharia profissional.

Entregas:

* Monorepo configurado
* Docker funcionando
* Ambientes local/dev
* GitHub Actions
* ESLint
* Prettier
* Ruff
* Pytest
* Alembic
* Estrutura modular do backend
* Estrutura feature-based do frontend
* Configuração de variáveis de ambiente
* README inicial
* ADRs iniciais

Fora do escopo:

* Funcionalidades de negócio
* Componentes complexos
* Deploy em produção

Critério de conclusão:

Um novo desenvolvedor consegue clonar o projeto e executar toda a aplicação com um único comando.

---

# Milestone 1 - Autenticação

Objetivo:

Permitir usuários reais utilizando a aplicação.

Entregas:

* Cadastro
* Login
* Logout
* Refresh Token
* Recuperação de senha
* Persistência de sessão
* Tema Light/Dark

Fora do escopo:

* OAuth
* Login social
* Perfis públicos

Critério de conclusão:

Usuários conseguem criar contas e manter sessões autenticadas.

---

# Milestone 2 - Biblioteca

Objetivo:

Permitir gerenciamento completo da biblioteca pessoal.

Entregas:

* Adicionar livro
* Editar livro
* Remover livro
* Pesquisa
* Filtros
* Status:

  * Quero Ler
  * Lendo
  * Concluído
  * Abandonado
* Upload ou importação de capa
* Tela de detalhes do livro

Fora do escopo:

* Compartilhamento
* Recomendações
* Integração com APIs externas

Critério de conclusão:

Toda a biblioteca de um usuário pode ser gerenciada dentro do sistema.

---

# Milestone 3 - Sessões de Leitura

Objetivo:

Transformar leitura em eventos rastreáveis.

Entregas:

* Iniciar sessão
* Encerrar sessão
* Controle de tempo
* Registro de páginas
* Histórico de sessões
* Atualização automática do progresso

Fora do escopo:

* Gamificação
* Pomodoro
* Sincronização em tempo real

Critério de conclusão:

Toda atividade de leitura gera dados históricos consistentes.

---

# Milestone 4 - Notas

Objetivo:

Permitir captura e organização de conhecimento.

Entregas:

* Editor Markdown
* Preview
* CRUD de notas
* Organização por livro
* Busca textual

Fora do escopo:

* IA
* Colaboração
* Compartilhamento

Critério de conclusão:

O usuário consegue registrar e recuperar facilmente suas reflexões de leitura.

---

# Milestone 5 - Dashboard

Objetivo:

Oferecer visibilidade sobre hábitos de leitura.

Entregas:

* Livro atual
* Livros concluídos
* Horas lidas
* Páginas lidas
* Streak
* Metas
* Heatmap estilo GitHub
* Métricas anuais

Fora do escopo:

* Analytics avançados
* Comparações entre usuários

Critério de conclusão:

O dashboard consegue responder:

* Estou lendo com frequência?
* Estou evoluindo?
* Estou próximo das minhas metas?

---

# Milestone 6 - Metas

Objetivo:

Adicionar direcionamento e acompanhamento.

Entregas:

* Meta de livros
* Meta de páginas
* Meta de horas
* Indicadores de progresso

Critério de conclusão:

O usuário consegue estabelecer objetivos anuais e acompanhar sua evolução.

---

# Milestone 7 - Hardening

Objetivo:

Elevar o projeto para nível de produção.

Entregas:

Observabilidade:

* Logs estruturados
* Sentry
* Tracing

Segurança:

* Rate limiting
* CORS
* Headers
* Secret management

Performance:

* Índices
* Paginação
* Query optimization

Qualidade:

* Cobertura de testes
* Testes E2E
* Métricas de qualidade

Critério de conclusão:

A aplicação suporta crescimento sem perda significativa de qualidade.

---

# Backlog Futuro

## IA

* Resumos
* Flashcards
* Busca semântica
* Recomendações
* Chat sobre anotações

## Social

* Feed
* Seguidores
* Comentários
* Reações
* Compartilhamento

## Monetização

* Planos
* Assinaturas
* Stripe
* AbacatePay
* Feature Flags

## Mobile

* React Native
* Notificações
* Modo offline
* Sincronização

---

# Definição de Pronto (Definition of Done)

Uma funcionalidade só é considerada concluída quando:

* Requisitos implementados
* Testes criados
* Tipagem completa
* Documentação atualizada
* Responsividade validada
* Dark Mode validado
* Acessibilidade mínima atendida
* Nenhum erro de lint
* Build funcionando
* Código revisado

---

# Objetivo de Longo Prazo

Transformar o Livrero em uma plataforma de acompanhamento da vida de leitura capaz de unir:

biblioteca pessoal +
rastreamento de hábitos +
gestão de conhecimento +
comunidade +
assistentes de IA
