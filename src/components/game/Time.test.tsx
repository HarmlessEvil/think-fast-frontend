import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timer } from './Timer.tsx';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  test('renders initial time correctly', () => {
    render(<Timer until={new Date(Date.now() + 5_000)}/>);
    expect(screen.getByText('5 seconds')).toBeInTheDocument();
  });

  test('counts down every second', async () => {
    render(<Timer until={new Date(Date.now() + 5_000)}/>);
    expect(screen.getByText('5 seconds')).toBeInTheDocument();

    vi.advanceTimersByTime(1_000);
    expect(await screen.findByText('4 seconds')).toBeInTheDocument();

    vi.advanceTimersByTime(2_000);
    expect(await screen.findByText('2 seconds')).toBeInTheDocument();

    vi.advanceTimersByTime(2_000);
    expect(await screen.findByText('0 seconds')).toBeInTheDocument();
  });
});
