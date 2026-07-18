import { useEffect, useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import './LandingPage.css'

const CTA_LABEL = 'Criar conta grátis'

const SECTIONS = [
  { id: 'abertura',     label: 'Abertura' },
  { id: 'o-habito',     label: 'O Hábito' },
  { id: 'os-recursos',  label: 'Os Recursos' },
  { id: 'como-comeca',  label: 'Como Começa' },
  { id: 'a-estante',    label: 'A Estante' },
  { id: 'perguntas',    label: 'Perguntas' },
  { id: 'encerramento', label: 'Encerramento' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const FAQ_ITEMS = [
  {
    q: 'O Livrero é gratuito?',
    a: 'Sim — completamente. Crie sua conta, monte sua estante e registre sessões sem pagar nada e sem precisar de cartão de crédito.',
  },
  {
    q: 'Preciso instalar alguma coisa?',
    a: 'Não. O Livrero roda direto no navegador, no computador, tablet ou celular. Abra, entre e pronto.',
  },
  {
    q: 'Posso importar os livros que já li?',
    a: 'Sim. Busque por título ou autor e os dados são preenchidos automaticamente. Ou adicione manualmente — você no controle.',
  },
  {
    q: 'Minhas anotações ficam privadas?',
    a: 'Sim. Suas anotações são suas. Protegidas por autenticação segura e visíveis somente para você.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Funciona. A interface foi pensada para a leitura em movimento — registre uma sessão enquanto o livro ainda está na mão.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  /* Revela anotações e grifos ao rolar */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = parseInt(el.dataset.reveal ?? '0', 10)
            setTimeout(() => el.classList.add('mg-visible'), delay)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    revealables.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* Rastreia seção ativa para o dot nav */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target as HTMLElement)
            if (idx >= 0) setActiveSection(idx)
          }
        })
      },
      { threshold: 0.35 },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = useCallback((id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const onNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast.success('Inscrição recebida! Em breve, novidades do Livrero.')
    e.currentTarget.reset()
  }

  return (
    <div className="mg-root">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────────── */}
      <header className="mg-header">
        <Link to="/" className="mg-wordmark">Livrero</Link>
        <div className="mg-header-actions">
          <Link to="/login" className="mg-login-link">Entrar</Link>
          <ThemeToggle />
          <Link to="/register">
            <Button variant="primary">{CTA_LABEL}</Button>
          </Link>
        </div>
      </header>

      {/* ── Navegação lateral (dots) ───────────────────────────────────────────── */}
      <nav className="mg-side-nav" aria-label="Navegação pelo livro">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={s.label}
            aria-current={i === activeSection ? 'true' : undefined}
            className={`mg-dot${i === activeSection ? ' mg-dot--active' : ''}`}
            onClick={() => scrollTo(s.id)}
          />
        ))}
      </nav>

      {/* ── Página do livro ────────────────────────────────────────────────────── */}
      <main className="mg-book">

        {/* § Abertura ─────────────────────────────────────────────────────────── */}
        <section id="abertura" className="mg-section">
          <aside className="mg-margin mg-margin--left" aria-hidden="true">
            <div className="mg-annotation" data-reveal="400">
              <span>esse sou eu</span>
            </div>
          </aside>

          <div className="mg-text">
            <p className="mg-eyebrow">Para quem vive entre livros</p>
            <h1 className="mg-title">Livrero</h1>

            <p className="mg-prose mg-prose--lead">
              <span className="mg-dropcap">E</span>xiste um tipo de leitor que não é
              apenas um leitor. É alguém que{' '}
              <mark className="mg-mark" data-reveal="200">
                dobra páginas, escreve nas margens, guarda recibos de livraria por anos
              </mark>{' '}
              — como se os papéis que ficam entre as páginas também contassem alguma coisa.
            </p>
            <p className="mg-prose">
              Para esse leitor, um livro não termina na última página. Termina meses depois,
              numa prateleira, quando ele pega o volume de volta e encontra uma anotação
              que não lembra de ter escrito.
            </p>
            <p className="mg-prose">
              O Livrero foi feito para que{' '}
              <mark className="mg-mark" data-reveal="300">
                tudo que acontece entre a primeira e a última página
              </mark>{' '}
              seja lembrado.
            </p>
          </div>

          <aside className="mg-margin mg-margin--right" aria-hidden="true">
            <div className="mg-annotation mg-annotation--emphasized" data-reveal="600">
              <span>Tudo que acontece entre<br />a primeira e a última página<br />merece ser lembrado.</span>
            </div>
          </aside>
        </section>

        <div className="mg-rule" />

        {/* § O hábito ──────────────────────────────────────────────────────────── */}
        <section id="o-habito" className="mg-section">
          <aside className="mg-margin mg-margin--left" aria-hidden="true">
            <div className="mg-annotation" data-reveal="300">
              <span>sessão a sessão ✓</span>
            </div>
            <div className="mg-annotation mg-annotation--box" data-reveal="700" style={{ marginTop: '120px' }}>
              <span>mapa de calor —<br />cada dia que eu li</span>
            </div>
          </aside>

          <div className="mg-text">
            <p className="mg-running">I · O hábito</p>
            <h2 className="mg-chapter">Três gestos. Uma vida inteira de leitura.</h2>

            <p className="mg-prose">
              <span className="mg-dropcap">L</span>er com regularidade não é disciplina.
              É ritmo — um ritmo que se constrói{' '}
              <mark className="mg-mark" data-reveal="100">sessão a sessão, página a página</mark>,
              até que o hábito se torna invisível, como respirar.
            </p>
            <p className="mg-prose">
              Mas ritmos precisam de memória para sobreviver. Sem memória, cada sessão começa
              do zero. Sem memória, o hábito desaparece silenciosamente — e só percebemos
              quando o livro na mesinha está há três semanas sem ser tocado.
            </p>
            <p className="mg-prose">
              O Livrero guarda esse ritmo por você. Cada dia de leitura, cada sessão aberta
              e fechada, cada sequência de noites em que você não perdeu um único dia.
            </p>
          </div>

          <aside className="mg-margin mg-margin--right" aria-hidden="true">
            <div className="mg-annotation mg-annotation--feature" data-reveal="400">
              <span>⏱ Sessões com tempo e páginas</span>
            </div>
            <div className="mg-annotation mg-annotation--feature" data-reveal="700" style={{ marginTop: '56px' }}>
              <span>📅 Mapa de constância visual</span>
            </div>
            <div className="mg-annotation mg-annotation--feature" data-reveal="1000" style={{ marginTop: '56px' }}>
              <span>🔥 Sequência de dias</span>
            </div>
          </aside>
        </section>

        <div className="mg-rule" />

        {/* § Os recursos ───────────────────────────────────────────────────────── */}
        <section id="os-recursos" className="mg-section">
          <aside className="mg-margin mg-margin--left" aria-hidden="true">
            <div className="mg-annotation mg-annotation--feature" data-reveal="200">
              <span>📚 Biblioteca pessoal</span>
            </div>
            <div className="mg-annotation mg-annotation--feature" data-reveal="500" style={{ marginTop: '56px' }}>
              <span>📝 Notas em markdown</span>
            </div>
            <div className="mg-annotation mg-annotation--feature" data-reveal="800" style={{ marginTop: '56px' }}>
              <span>🎯 Metas anuais</span>
            </div>
          </aside>

          <div className="mg-text">
            <p className="mg-running">II · Os recursos</p>
            <h2 className="mg-chapter">Para leitor sério. Sem excessos.</h2>

            <p className="mg-prose">
              <span className="mg-dropcap">C</span>ada funcionalidade foi pensada para
              quem lê por prazer, não por obrigação. A estante guarda todos os livros
              que você já tocou —{' '}
              <mark className="mg-mark" data-reveal="100">lido, abandonado, na fila</mark>{' '}
              — com capa, autor e progresso.
            </p>
            <p className="mg-prose">
              As notas ficam organizadas por livro, escritas em markdown — para quem quer
              mais do que um campo de texto simples. As sessões registram páginas e duração.
              E o painel reúne tudo: o livro atual, as metas do ano, o mapa de constância.
            </p>
            <p className="mg-prose">
              Cinco recursos. Uma só estante.{' '}
              <mark className="mg-mark" data-reveal="300">
                Sem notificações, sem redes sociais, sem recomendações algorítmicas.
              </mark>{' '}
              Só você e os livros.
            </p>
          </div>

          <aside className="mg-margin mg-margin--right" aria-hidden="true">
            <div className="mg-annotation" data-reveal="350" style={{ marginTop: '40px' }}>
              <span>tenho 47 livros lá já</span>
            </div>
            <div className="mg-annotation mg-annotation--emphasized" data-reveal="900" style={{ marginTop: '100px' }}>
              <span>isso é o que eu precisava</span>
            </div>
          </aside>
        </section>

        <div className="mg-rule" />

        {/* § Como começa ───────────────────────────────────────────────────────── */}
        <section id="como-comeca" className="mg-section">
          <aside className="mg-margin mg-margin--left" aria-hidden="true">
            <div className="mg-annotation mg-annotation--box" data-reveal="300">
              <span>1. adicione o livro<br />2. abra uma sessão<br />3. anote o progresso</span>
            </div>
          </aside>

          <div className="mg-text">
            <p className="mg-running">III · O início</p>
            <h2 className="mg-chapter">Sua leitura tem uma história. Aqui ela aparece.</h2>

            <p className="mg-prose">
              <span className="mg-dropcap">C</span>omeçar é simples. Procure um livro pelo
              título ou pelo autor — o Livrero encontra a capa, o número de páginas, o gênero.
              Você escolhe onde ele está e{' '}
              <mark className="mg-mark" data-reveal="150">ele vai para a sua estante em segundos.</mark>
            </p>
            <p className="mg-prose">
              A partir daí, cada vez que você abrir uma sessão de leitura, ela fica registrada.
              Páginas de início e fim, duração, data. Sem formulário complicado — só o essencial.
            </p>
            <p className="mg-prose">
              E depois de algumas semanas, o painel começa a mostrar uma história que você não
              sabia que estava escrevendo: quantos livros este ano, qual sua sequência mais longa,
              onde você lê mais.
            </p>
          </div>

          <aside className="mg-margin mg-margin--right" aria-hidden="true">
            <div className="mg-annotation" data-reveal="500" style={{ marginTop: '60px' }}>
              <span>12 dias de sequência —<br />minha recorde</span>
            </div>
          </aside>
        </section>

        <div className="mg-rule" />

        {/* § A estante ─────────────────────────────────────────────────────────── */}
        <section id="a-estante" className="mg-section">
          <aside className="mg-margin mg-margin--left" aria-hidden="true">
            <div className="mg-annotation" data-reveal="250">
              <span>reorganizei três vezes —<br />cada vez mais honesta</span>
            </div>
          </aside>

          <div className="mg-text">
            <p className="mg-running">IV · A coleção</p>
            <h2 className="mg-chapter">Uma estante que te conhece.</h2>

            <p className="mg-prose">
              <span className="mg-dropcap">H</span>á uma diferença entre uma lista de livros
              e uma estante. A lista é um inventário. A estante é uma autobiografia.
            </p>
            <p className="mg-prose">
              Cada livro na sua estante do Livrero carrega mais do que título e autor. Carrega
              o status — se você está lendo, se largou no meio, se está esperando o momento
              certo. Carrega{' '}
              <mark className="mg-mark" data-reveal="200">as anotações que você fez enquanto lia</mark>,
              as sessões que abriu e fechou, o progresso que avançou página a página.
            </p>
            <p className="mg-prose">
              Com o tempo, a estante vira um retrato. Não do que você pretende ler, mas do
              que você de fato viveu lendo.
            </p>
          </div>

          <aside className="mg-margin mg-margin--right" aria-hidden="true">
            <div className="mg-annotation mg-annotation--emphasized" data-reveal="400" style={{ marginTop: '80px' }}>
              <span>"uma autobiografia" —<br />exatamente isso</span>
            </div>
          </aside>
        </section>

        <div className="mg-rule" />

        {/* § Perguntas ─────────────────────────────────────────────────────────── */}
        <section id="perguntas" className="mg-section mg-section--faq">
          <div className="mg-text mg-text--wide">
            <p className="mg-running">V · Dúvidas</p>
            <h2 className="mg-chapter">Perguntas que merecem resposta.</h2>

            <div className="mg-faq">
              {FAQ_ITEMS.map((item) => (
                <details key={item.q} className="mg-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="mg-rule" />

        {/* § Encerramento + CTA ────────────────────────────────────────────────── */}
        <section id="encerramento" className="mg-section mg-section--closing">
          <div className="mg-text">
            <p className="mg-running">Epílogo</p>
            <p className="mg-prose mg-prose--closing">
              Alguns livros você lembra para sempre. Outros você esquece a história,
              mas lembra onde estava quando o leu — o cheiro da sala, o horário, a luz.
              O Livrero não garante memória. Garante que, quando você quiser lembrar,
              vai ter onde procurar.
            </p>
          </div>

          <div className="mg-sticky-note" data-reveal="300" aria-label="Chamada para ação">
            <p className="mg-sticky-heading">Comece agora.</p>
            <Link to="/register" className="mg-sticky-cta">{CTA_LABEL}</Link>
            <span className="mg-sticky-fine">grátis · sem cartão de crédito</span>
          </div>
        </section>

        {/* ── Colofão ─────────────────────────────────────────────────────────── */}
        <footer className="mg-colophon">
          <div className="mg-colophon-grid">
            <div>
              <span className="mg-colophon-brand">Livrero</span>
              <p className="mg-colophon-note">
                Esta edição foi composta em Source Serif 4 e Hanken Grotesk, às margens de
                uma janela qualquer. Guarda toda a sua história de leitura — enquanto você
                segue em frente.
              </p>
              <Link to="/register" className="mg-colophon-cta">{CTA_LABEL}</Link>
            </div>
            <div className="mg-colophon-links">
              <span className="mg-colophon-heading">Neste volume</span>
              <button type="button" onClick={() => scrollTo('o-habito')}>O hábito</button>
              <button type="button" onClick={() => scrollTo('os-recursos')}>Os recursos</button>
              <button type="button" onClick={() => scrollTo('como-comeca')}>Como começa</button>
              <button type="button" onClick={() => scrollTo('perguntas')}>Perguntas frequentes</button>
            </div>
            <div>
              <span className="mg-colophon-heading">Receba novidades</span>
              <form className="mg-newsletter" onSubmit={onNewsletterSubmit}>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  aria-label="Seu e-mail"
                />
                <Button type="submit" variant="primary">Inscrever</Button>
              </form>
              <p className="mg-colophon-fine">Sem spam. Só o que vale a leitura.</p>
            </div>
          </div>
          <div className="mg-colophon-bottom">
            © {new Date().getFullYear()} Livrero. Todos os direitos reservados.
          </div>
        </footer>

      </main>
    </div>
  )
}
