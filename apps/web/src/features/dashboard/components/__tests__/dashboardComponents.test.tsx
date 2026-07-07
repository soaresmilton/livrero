import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatCard } from '../StatCard';
import { GoalsProgress } from '../GoalsProgress';
import { ReadingHeatmap } from '../ReadingHeatmap';
import type { DashboardGoals, HeatmapDay } from '../../types';

describe('StatCard', () => {
  it('renders label, value and hint', () => {
    render(<StatCard label="Páginas lidas" value={120} hint="no total" />);
    expect(screen.getByText('Páginas lidas')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('no total')).toBeInTheDocument();
  });
});

describe('GoalsProgress', () => {
  const goals: DashboardGoals = {
    books: { target: 10, current: 4, percent: 40 },
    pages: { target: 0, current: 200, percent: 0 },
    minutes: { target: 600, current: 300, percent: 50 },
  };

  it('shows current/target for defined goals and "Sem meta" otherwise', () => {
    render(<GoalsProgress goals={goals} onEdit={() => {}} />);
    expect(screen.getByText('4 / 10')).toBeInTheDocument();
    // pages has target 0 -> Sem meta
    expect(screen.getByText('Sem meta')).toBeInTheDocument();
    // minutes converted to hours: 300min -> 5h / 600min -> 10h
    expect(screen.getByText('5 / 10 h')).toBeInTheDocument();
  });
});

describe('ReadingHeatmap', () => {
  it('summarizes number of active reading days', () => {
    const days: HeatmapDay[] = [
      { date: '2026-01-05', count: 30 },
      { date: '2026-02-10', count: 90 },
    ];
    render(<ReadingHeatmap year={2026} days={days} />);
    expect(screen.getByText(/2 dias de leitura em 2026/)).toBeInTheDocument();
  });
});
