# Livrero — Frontend Guidelines & Plano de Melhorias

> Documento vivo. Guia as decisões de UI/UX do frontend e organiza a evolução do
> produto em **etapas verificáveis**. Complementa (não substitui) o
> [`DESIGN.md`](./DESIGN.md), que define os tokens do design system.

**Status:** proposta inicial · **Última revisão:** 2026-07-09

---

## 1. Objetivo

Elevar o frontend do Livrero de "funcional, porém templatizado" para uma
experiência com **identidade própria, coerente e totalmente responsiva**, sem
reescrever a arquitetura. O trabalho é incremental: cada etapa entrega valor
isolado, passa no CI (`lint`, `typecheck`, `build`, testes) e pode ir para `dev`
sem depender das seguintes.

Três frentes correm em paralelo conceitualmente, mas são sequenciadas para
reduzir risco:

1. **Saúde técnica** — remover cores hardcoded, consertar dark mode, unificar tokens.
2. **Responsividade** — mobile-first real, do login ao dashboard (hoje inexistente).
3. **Identidade visual** — dar ao Livrero uma assinatura que não se confunda com um template.

---

## 2. Princípios de design

Herdados do conceito de **"Santuário Digital"** do `DESIGN.md`, tornados operacionais:

- **A UI recua, o conteúdo avança.** Capas de livro, títulos e a escrita do usuário
  são o espetáculo. Bordas, sombras e chrome ficam discretos.
- **Tudo vem dos tokens.** Nenhuma cor literal (`#ffffff`, `bg-blue-100`,
  `border-indigo-500`) em componente. Se uma cor não existe no sistema, ela é
  adicionada ao sistema — não improvisada no JSX.
- **Ritmo de 8px.** Espaçamentos são múltiplos de 8 (4px permitido em detalhes finos).
- **Tipografia é a personalidade.** Source Serif 4 para vozes editoriais (títulos,
  números de destaque, folios); Hanken Grotesk para UI e dados. O serif é usado
  com **intenção**, não em qualquer texto grande.
- **Dark mode é cidadão de primeira classe.** Cada tela é verificada nos dois temas
  antes de ser considerada pronta.
- **Piso de qualidade sem alarde.** Foco de teclado visível, `prefers-reduced-motion`
  respeitado, alvos de toque ≥ 44px, contraste AA.

---

## 3. Diagnóstico do estado atual

### 3.1 Dívida técnica (bloqueia dark mode e coerência)

| # | Onde | Problema | Impacto |
|---|------|----------|---------|
| T1 | `features/books/components/BookCard.tsx` | `bg-[#ffffff]` hardcoded no card e no corpo | Card fica branco no dark mode |
| T2 | `BookCard.tsx` | Barra de progresso `#f8c12a` (amarelo) e datas `#1da073` (verde) fora do sistema | Conflita com a secundária terracota definida no `DESIGN.md` |
| T3 | `BookCard.tsx` | Status chips em paleta Tailwind crua (`bg-blue-100`, `text-amber-800`, `bg-rose-100`…) | Não respeitam tokens nem dark mode |
| T4 | `BookCard.tsx` | Menu de ações `bg-black/40`, gêneros `bg-[#d4e8d1]` fixo | Baixa legibilidade no dark mode |
| T5 | `pages/LibraryPage.tsx` | Spinner com `border-indigo-500` | Cor estranha à marca |
| T6 | `components/layout/MainLayout.tsx` | Header/overlay mobile com `bg-white/80 dark:bg-neutral-900/80`, `border-neutral-200` | Fora dos tokens |
| T7 | Global | Emojis inline (`👋`, `📖`) em títulos | Quebram o tom editorial |
| T8 | Global | `fontFamily` inline repetido (`style={{ fontFamily: 'Source Serif 4…' }}`) em dezenas de lugares | Deveria ser utilitário/classe |

### 3.2 Responsividade (frente explícita do pedido — hoje ausente)

| # | Onde | Problema |
|---|------|----------|
| R1 | `LibraryPage` | `px-8` fixo; em telas < 400px o conteúdo encosta nas bordas |
| R2 | `MainLayout` | Botão do menu mobile abre o drawer, mas navegar **não fecha** o menu; sem `aria` de estado |
| R3 | Sidebar | Só existe em `md+`; no mobile não há navegação persistente (nem bottom-nav nem drawer confiável) |
| R4 | Header da Library | Busca + toggles + botão "Adicionar" empilham mal em telas estreitas |
| R5 | Dashboard | Grid de stats `grid-cols-2` ok, mas os dois cards grandes (`lg:grid-cols-2`) ficam apertados em tablet |
| R6 | ReadingHeatmap | Rola horizontalmente, mas sem indicação de scroll nem versão compacta mobile |
| R7 | Tipografia | Tamanhos fixos (`text-3xl`, `text-4xl`) sem escala fluida entre breakpoints |
| R8 | Modais | Precisam de auditoria em viewport pequeno (altura, scroll interno, teclado virtual) |

### 3.3 Identidade (frente de design)

O conjunto atual — **fundo cream `#fcf9f4` + serif de display + acento terracota** —
é exatamente o "template padrão de IA nº 1". É legítimo, mas é um *default*, não uma
*escolha*. Falta o **elemento-assinatura**: algo que faça alguém lembrar "isto é o
Livrero". Ver §5.

---

## 4. Estratégia de responsividade (UX + UI)

> Frente prioritária. A aplicação será **mobile-first**: o layout base é o do celular
> e cresce para cima. Nenhuma tela pode ter scroll horizontal indesejado.

### 4.1 Breakpoints (Tailwind default, formalizados)

| Token | Largura | Alvo | Layout de navegação |
|-------|---------|------|---------------------|
| `base` | 0–639px | Celular | **Bottom navigation** fixa |
| `sm` | ≥ 640px | Celular grande / phablet | Bottom navigation |
| `md` | ≥ 768px | Tablet retrato | **Sidebar** aparece |
| `lg` | ≥ 1024px | Tablet paisagem / laptop | Sidebar + conteúdo em 2 colunas |
| `xl` | ≥ 1280px | Desktop | Largura máxima do container (1280px) |

### 4.2 Navegação — a decisão central

**Problema:** hoje o mobile depende de um drawer com bugs (R2/R3).

**Decisão proposta:** substituir o drawer por uma **bottom navigation bar** no mobile
(< `md`), com os 4 destinos principais (Dashboard, Biblioteca, Sessões, Anotações).
Padrão nativo de apps de leitura (Kindle, Storygraph), alcança o polegar, sempre
visível, sem estado de "aberto/fechado" para gerenciar.

```
Mobile (< md)                    Desktop (>= md)
┌─────────────────────┐          ┌────────┬──────────────────┐
│  Header (título)    │          │        │  Conteúdo        │
│                     │          │ Side   │                  │
│                     │          │ bar    │                  │
│     Conteúdo        │          │        │                  │
│                     │          │ (nav)  │                  │
│                     │          │        │                  │
├──┬──┬──┬──┬─────────┤          │ tema   │                  │
│⌂ │▤ │◷ │✎ │  ← nav  │          │ sair   │                  │
└──┴──┴──┴──┴─────────┘          └────────┴──────────────────┘
```

- Ações secundárias (tema, sair) vão para o header mobile ou uma folha de perfil.
- A sidebar desktop permanece; ganha estado ativo mais legível (§5.3).

### 4.3 Grids responsivos

- **Biblioteca:** `grid-cols-2` no mobile → `auto-fill minmax(160px…)` progressivo.
  Cards menores no celular; capa mantém proporção 2:3.
  ```
  base: 2 col · sm: 3 col · md: 3–4 col · lg: 4–5 col · xl: 5–6 col
  ```
- **Dashboard stats:** `grid-cols-2` (mobile) → `grid-cols-4` (`lg`).
- **Dashboard blocos grandes** (Lendo agora / Metas): empilhados até `lg`, lado a
  lado a partir de `lg` (não `md`, para não apertar no tablet).

### 4.4 Padding e container

- Padrão de página: `px-4 sm:px-6 lg:px-8` (nunca `px-8` fixo).
- Container central: `mx-auto w-full max-w-7xl` — padronizar em **todas** as páginas
  (hoje só o Dashboard usa).

### 4.5 Tipografia fluida

- Títulos de página escalam por breakpoint: `text-2xl sm:text-3xl lg:text-4xl`.
- Estabelecer utilitários semânticos (`.text-display`, `.text-headline`) para não
  repetir `fontFamily` inline (resolve T8).

### 4.6 Toque e acessibilidade mobile

- Alvos interativos ≥ 44×44px (menu de 3 pontos do BookCard hoje é pequeno demais).
- `focus-visible` em todos os interativos.
- Modais: `max-h-[90dvh]` com scroll interno; usar `dvh` (não `vh`) por causa da
  barra do navegador mobile; considerar o teclado virtual em formulários.
- Heatmap: no mobile, indicar affordance de scroll (fade nas bordas) ou versão
  compacta por mês.

### 4.7 Definition of Done — responsividade

Cada tela só é "pronta" quando validada em **360px, 768px e 1280px**, nos dois temas,
sem scroll horizontal e com navegação alcançável.

---

## 5. Direção de identidade visual (proposta)

> Esta frente é uma **proposta** para discussão. As etapas 0–2 (§6) não dependem
> dela e podem começar já. A escolha final da assinatura será confirmada com o time.

### 5.1 A ideia: anatomia do livro como sistema

Em vez de trocar a paleta por outro default, aprofundamos o que o Livrero **é** — um
objeto editorial. Emprestamos a gramática do livro impresso: **fólios** (números de
página), **cabeços correntes** (running heads), **ex-libris** (o selo da biblioteca
pessoal) e **marginália** (a anotação à margem). Isso dá estrutura com significado, em
vez de decoração.

### 5.2 Ajustes de paleta (afastar do default)

Manter sage + paper, mas **quebrar o cream genérico** introduzindo um tom de **tinta**
(ink) profundo para texto e um uso mais disciplinado da terracota — reservada a
estados de progresso/leitura ativa, nunca como "cor de destaque" difusa. Detalhes de
hex a definir na Etapa 3 (validar contraste AA e os dois temas).

### 5.3 Elemento-assinatura (candidatos)

Escolher **um** para carregar a personalidade; o resto fica quieto:

- **A — O fólio & cabeço corrente:** cada página exibe um número de fólio e um cabeço
  discreto ("BIBLIOTECA · 128 volumes"), como a lombada de um livro. Barato, coerente,
  único.
- **B — Ex-libris ativo:** o item de navegação atual é marcado como um selo/carimbo,
  não um retângulo colorido — resolve o "estado ativo invisível" (T/R) com identidade.
- **C — Marginália:** metadados e dicas aparecem como anotação à margem, em itálico do
  serif, evocando quem escreve nas bordas do livro.

**Recomendação inicial:** A + B combinados (fólio nas páginas, ex-libris na nav),
mantendo C como toque pontual. Decidir junto antes de implementar.

---

## 6. Etapas de implementação

Cada etapa é um PR independente para `dev`, passando no CI.

### Etapa 0 — Fundação de tokens *(base para tudo)*
- Criar utilitários tipográficos semânticos (`.text-display`, `.text-headline`,
  `.text-label`) para eliminar `fontFamily` inline (T8).
- Adicionar tokens que faltam ao `index.css` (ex.: cor de progresso de leitura,
  cores semânticas de status) para não haver desculpa para hex cru.
- **Entrega:** nenhum visual muda; base pronta.

### Etapa 1 — Higiene de cores & dark mode *(consertar o que está quebrado)*
- Eliminar todo hex/paleta crua de `BookCard` (T1–T4), `LibraryPage` (T5),
  `MainLayout` (T6).
- Mapear status chips para tokens semânticos.
- Remover emojis dos títulos (T7).
- **Entrega:** dark mode íntegro em todas as telas existentes; zero cor literal em componente.

### Etapa 2 — Responsividade *(frente explícita do pedido)*
- Implementar bottom navigation mobile + limpar o drawer bugado (R2/R3).
- Padronizar container e paddings responsivos em todas as páginas (R1/R4).
- Grids responsivos (Biblioteca, Dashboard) (R5).
- Tipografia fluida (R7).
- Auditar modais e heatmap em viewport pequeno (R6/R8).
- Alvos de toque e `focus-visible` (§4.6).
- **Entrega:** app usável de 360px a 1280px, validado nos dois temas.

### Etapa 3 — Identidade visual *(depende de §5 confirmada)*
- Ajuste de paleta (ink + terracota disciplinada).
- Implementar o elemento-assinatura escolhido (fólio + ex-libris).
- Refinar hierarquia de StatCards e estado ativo da navegação.
- **Entrega:** o Livrero deixa de parecer template.

### Etapa 4 — Polimento & microinterações *(opcional, por último)*
- Reveal on scroll discreto, hover states, transições de página respeitando
  `prefers-reduced-motion`.
- Estados vazios e de erro com voz e direção (não genéricos).
- **Entrega:** acabamento que "não se anuncia".

---

## 7. Convenções de código (frontend)

- **Zero cores literais** em componentes. Sempre `var(--color-*)` ou classe utilitária.
- **Mobile-first:** escrever o estilo base para mobile e adicionar `sm:`/`md:`/`lg:`
  para cima — nunca o contrário.
- **Sem `fontFamily` inline:** usar as classes tipográficas da Etapa 0.
- **Composição:** componentes pequenos e testáveis; exports nomeados.
- **Acessibilidade não é opcional:** `aria-*` em estados de navegação, foco visível,
  contraste AA.
- **Testar nos dois temas** antes de abrir PR.

---

## 8. Checklist por PR (Definition of Done)

- [ ] Sem cor literal fora dos tokens
- [ ] Validado em 360px, 768px e 1280px
- [ ] Sem scroll horizontal indesejado
- [ ] Dark mode e light mode conferidos
- [ ] Foco de teclado visível; alvos de toque ≥ 44px
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` e testes passando
- [ ] `prefers-reduced-motion` respeitado (se houver animação)
