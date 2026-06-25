# Product Backlog: Livrero

## Próximos Passos & Melhorias

### Lixeira e Recuperação de Livros (Restore)
- **Descrição**: Como adotamos a estratégia de exclusão lógica (Soft Delete) no Milestone 2, os livros deletados continuam persistindo no banco de dados com a flag `is_deleted = True`. O próximo passo lógico para o produto é fornecer uma visualização "Lixeira" para o usuário.
- **Funcionalidades**:
  - Página ou seção `Lixeira`.
  - Endpoint na API para buscar apenas livros excluídos.
  - Endpoint `POST /books/{id}/restore` para mudar a flag `is_deleted` para `False`.
  - Exclusão Permanente (Hard Delete manual pela Lixeira ou retenção por 30 dias).

### Reading Sessions (Sessões de Leitura)
- **Descrição**: Modelagem da entidade que atrela um Livro ao progresso do usuário.
- **Funcionalidades**:
  - `start_date`, `end_date`, `pages_read`.
  - Permitir múltiplas releituras.
  - Tela dedicada de Detalhes do Livro (`/books/{id}`) para fazer os check-ins diários de leitura.

### Dashboard & Estatísticas
- **Descrição**: Visão global da vida de leitor do usuário.
- **Funcionalidades**:
  - Filtros avançados por ano, mês ou data de conclusão.
  - Gráficos de barra: "Páginas lidas por mês".
  - Livros Favoritados.
