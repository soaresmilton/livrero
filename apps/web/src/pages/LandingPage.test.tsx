import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { LandingPage } from './LandingPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage — Marginália', () => {
  test('renders the title and tagline', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Livrero' })).toBeInTheDocument()
    expect(
      screen.getByText(/tudo que acontece entre a primeira e a última página/i),
    ).toBeInTheDocument()
  })

  test('renders CTA links to register', () => {
    renderPage()
    const ctaLinks = screen.getAllByRole('link', { name: 'Criar conta grátis' })
    expect(ctaLinks.length).toBeGreaterThan(0)
    ctaLinks.forEach((link) => expect(link).toHaveAttribute('href', '/register'))
  })

  test('renders login link', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
  })

  test('renders section navigation with one dot per section', () => {
    renderPage()
    const nav = screen.getByRole('navigation', { name: 'Navegação pelo livro' })
    expect(nav.querySelectorAll('button')).toHaveLength(7)
  })

  test('renders all chapter headings', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /Três gestos/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Para leitor sério/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Sua leitura tem uma história/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Uma estante/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Perguntas que merecem resposta.' })).toBeInTheDocument()
  })

  test('renders the FAQ section', () => {
    renderPage()
    expect(screen.getByText('O Livrero é gratuito?')).toBeInTheDocument()
    expect(screen.getByText('Preciso instalar alguma coisa?')).toBeInTheDocument()
  })

  test('renders the colophon with newsletter form', () => {
    renderPage()
    expect(screen.getByText(/Esta edição foi composta em Source Serif 4/)).toBeInTheDocument()
    expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inscrever' })).toBeInTheDocument()
  })
})
