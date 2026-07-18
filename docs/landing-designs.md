# Landing Page — Direções de Design

Conceitos explorados antes de implementar o Conceito 1 (Marginália).

---

## Conceito 1 — Marginália ✅ *implementado*

**Premissa:** a landing page é literalmente uma página de livro — tipografia editorial densa,
margens generosas. Enquanto o usuário rola, as margens se enchem de anotações manuscritas
(fonte Caveat, rotação sutil, cores de tinta diferentes), como se um leitor estivesse anotando
enquanto lê. As anotações são a copy do produto, escritas como pensamentos privados.

**Identidade visual:**
- Papel: `#F2EDE5` · Tinta: `#2C2416` · Marginália: `#7B4F2E`
- Grifo amarelo: `rgba(245, 226, 50, 0.38)` animado left→right
- Source Serif 4 (prosa) + Caveat (anotações) + Hanken Grotesk (UI)
- Layout 3 colunas: margem esquerda | texto (620px) | margem direita
- Cada anotação surge com IntersectionObserver ao entrar no viewport

**Assinatura:** a forma é o conteúdo — experimentar uma anotação sendo escrita na margem
de um livro é experimentar a função mais íntima do produto.

---

## Conceito 2 — A Sessão em Curso

**Premissa:** o hero é uma sessão de leitura ativa. Tela quase preta, timer pulsando,
título do livro, página atual. A sensação de ter interrompido o momento mais privado
de alguém. Ao rolar, o log da sessão se expande — progresso, heatmap do ano, notas do dia.

**Identidade visual:**
- Fundo: quase preto `#0D0B08` · Texto: amber `#E8A84A`
- Fonte monospace para dados de sessão
- Zero imagens, zero ilustrações — só dados apresentados com precisão cirúrgica
- Timer pulsando como um cursor de terminal

**Assinatura:** ambiente de leitura noturna — voyeurista, íntimo, específico.
O produto se vende ao se mostrar em uso real, sem uma palavra de marketing.

---

## Conceito 3 — O Inventário

**Premissa:** tela escura. Uma máquina de escrever digita sozinha um inventário
de vida literária: *"Crime e Castigo — Dostoiévski — lido março 2019 — 36h — abandonado
pág. 283 — motivo: mudança de emprego"*. Linha após linha. Cada item é uma memória real.

**Identidade visual:**
- Fundo: `#0A0906` · Texto: bege `#E8DFC9` em fonte monospace
- Animação de datilografia com velocidade variável (algumas linhas rápidas, com correções)
- Cursor piscando · contador de livros e anos ao final

**Copy central:** *"Sua lista existe. Você só ainda não tem onde guardá-la."*

**Assinatura:** brutalismo tipográfico. A austeridade extrema é o argumento.
