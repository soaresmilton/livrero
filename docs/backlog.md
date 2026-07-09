# Product Backlog: Livrero

## Próximos Passos & Melhorias

### Lixeira e Recuperação de Livros (Restore)
- **Descrição**: Como adotamos a estratégia de exclusão lógica (Soft Delete) no Milestone 2, os livros deletados continuam persistindo no banco de dados com a flag `is_deleted = True`. O próximo passo lógico para o produto é fornecer uma visualização "Lixeira" para o usuário.
- **Funcionalidades**:
  - Página ou seção `Lixeira`.
  - Endpoint na API para buscar apenas livros excluídos.
  - Endpoint `POST /books/{id}/restore` para mudar a flag `is_deleted` para `False`.
  - Exclusão Permanente (Hard Delete manual pela Lixeira ou retenção por 30 dias).


  ### Ordenação na página de livros
  - **Descrição**: A página de livros deve permitir a ordenação dos livros por diversos critérios.
  - **Funcionalidades**:
    - Ordenação por título.
    - Ordenação por autor.
    - Ordenação por data de criação.
    - Ordenação por data de atualização.


  ### Histórico de sessões de leitura
  - **Descrição**: A página de sessões de leitura deve permitir a visualização das sessões de leitura por diversos critérios.
  - **Funcionalidades**:
    - Ordenação por data de início
    - Ordenação por data de fim
    - Ordenação por duração
    - Ordenação por número de páginas lidas
  - **Estrutura das colunas**: 
    - Data de Início
    - Data de Fim
    - Nome do Livro
    - Duração
    - Número de Páginas Lidas
    
### Marcar como concluído
- **Descrição**: Quando o usuário selecionar a opção "Marcar como Lido", no modal de confirmação, disponibilizar para ele a nota de avaliação.


### Melhorar dashboard
- **Descrição**: A página de dashboard deve fornecer informações mais detalhadas sobre o progresso do usuário.
- **Funcionalidades**:
  - Gráfico de progresso de leitura (ex: número de livros lidos por mês).
  - Estatísticas de leitura (ex: média de páginas lidas por sessão, tempo médio de leitura por livro).
  - Sugestões de livros com base no histórico de leitura do usuário